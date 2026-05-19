import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'ID пациента должен быть числом' })
  @IsPositive({ message: 'ID пациента должен быть положительным' })
  patient_id: number;

  @ApiProperty({ example: 'ОРВИ' })
  @IsString({ message: 'Диагноз должен быть строкой' })
  @IsNotEmpty({ message: 'Диагноз обязателен' })
  diagnosis: string;

  @ApiProperty({ example: 'Назначен постельный режим и обильное питьё', required: false })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;
}
