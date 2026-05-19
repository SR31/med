import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointments/entities/appointment.entity';
import { MedicalRecord } from './records/entities/medical-record.entity';
import { AppointmentsModule } from './appointments/appointments.module';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'med',
      password: process.env.DB_PASS || 'med',
      database: process.env.DB_NAME || 'med',
      entities: [Appointment, MedicalRecord],
      synchronize: true
    }),
    AppointmentsModule,
    RecordsModule
  ]
})
export class AppModule {}
