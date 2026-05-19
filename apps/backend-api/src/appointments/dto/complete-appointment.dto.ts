import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteAppointmentDto {
  @ApiProperty({ example: 'Острый бронхит' })
  @IsString()
  @IsNotEmpty({ message: 'Диагноз обязателен' })
  diagnosis: string;

  @ApiProperty({ example: 'Назначены антибиотики на 7 дней' })
  @IsString()
  description: string;
}
