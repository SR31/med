import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Некорректный адрес электронной почты' })
  email: string;

  @ApiProperty({ example: 'qwerty123' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  password: string;

  @ApiProperty({ example: 'Иван Иванов' })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Полное имя обязательно' })
  full_name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT })
  @IsEnum(UserRole, { message: 'Роль должна быть PATIENT или DOCTOR' })
  role: UserRole;
}
