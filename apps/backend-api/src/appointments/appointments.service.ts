import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { MedicalRecord } from '../records/entities/medical-record.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';

interface JwtPayload {
  sub: number;
  role: 'PATIENT' | 'DOCTOR';
  email: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly repo: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private readonly records: Repository<MedicalRecord>
  ) {}

  list(user: JwtPayload) {
    const where = user.role === 'DOCTOR' ? { doctor_id: user.sub } : { patient_id: user.sub };
    return this.repo.find({ where, order: { date: 'ASC' } });
  }

  create(user: JwtPayload, dto: CreateAppointmentDto) {
    if (user.role !== 'PATIENT') {
      throw new HttpException('Только пациент может создать запись', HttpStatus.FORBIDDEN);
    }
    return this.repo.save({
      patient_id: user.sub,
      doctor_id: dto.doctor_id,
      date: new Date(dto.date),
      status: 'PENDING'
    });
  }

  async complete(user: JwtPayload, id: number, dto: CompleteAppointmentDto) {
    if (user.role !== 'DOCTOR') {
      throw new HttpException('Только врач может завершить приём', HttpStatus.FORBIDDEN);
    }
    const appointment = await this.repo.findOne({ where: { id } });
    if (!appointment) {
      throw new HttpException('Запись не найдена', HttpStatus.NOT_FOUND);
    }
    if (appointment.doctor_id !== user.sub) {
      throw new HttpException('У вас нет доступа к этой записи', HttpStatus.FORBIDDEN);
    }
    if (appointment.status === 'COMPLETED') {
      throw new HttpException('Приём уже завершён', HttpStatus.BAD_REQUEST);
    }
    appointment.status = 'COMPLETED';
    await this.repo.save(appointment);
    await this.records.save({
      patient_id: appointment.patient_id,
      doctor_id: user.sub,
      diagnosis: dto.diagnosis,
      description: dto.description || ''
    });
    return appointment;
  }
}
