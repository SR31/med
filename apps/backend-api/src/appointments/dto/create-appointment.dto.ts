import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'ID врача должен быть числом' })
  @IsPositive({ message: 'ID врача должен быть положительным' })
  doctor_id: number;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  @IsDateString({}, { message: 'Некорректный формат даты' })
  date: string;
}
