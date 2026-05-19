import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MedicalRecord } from './entities/medical-record.entity';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-change-me'
    })
  ],
  controllers: [RecordsController],
  providers: [RecordsService, JwtGuard]
})
export class RecordsModule {}
