import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateRecordDto } from './dto/create-record.dto';

interface JwtPayload {
  sub: number;
  role: 'PATIENT' | 'DOCTOR';
  email: string;
}

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(MedicalRecord) private readonly repo: Repository<MedicalRecord>
  ) {}

  findMine(user: JwtPayload) {
    return this.repo.find({
      where: { patient_id: user.sub },
      order: { created_at: 'DESC' }
    });
  }

  create(user: JwtPayload, dto: CreateRecordDto) {
    if (user.role !== 'DOCTOR') {
      throw new HttpException('Только врач может создавать записи в карте', HttpStatus.FORBIDDEN);
    }
    return this.repo.save({
      patient_id: dto.patient_id,
      diagnosis: dto.diagnosis,
      description: dto.description || '',
      doctor_id: user.sub
    });
  }
}
