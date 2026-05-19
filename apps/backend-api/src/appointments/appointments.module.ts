import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Appointment } from './entities/appointment.entity';
import { MedicalRecord } from '../records/entities/medical-record.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, MedicalRecord]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-change-me'
    })
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, JwtGuard]
})
export class AppointmentsModule {}
