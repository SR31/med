import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new HttpException('Пользователь с таким email уже существует', HttpStatus.CONFLICT);
    }
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save({
      email: dto.email,
      full_name: dto.full_name,
      role: dto.role,
      password_hash
    });
    return { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new HttpException('Неверный email или пароль', HttpStatus.UNAUTHORIZED);
    }
    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) {
      throw new HttpException('Неверный email или пароль', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
      email: user.email
    });
    return {
      token,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }
    };
  }

  listDoctors() {
    return this.users.find({
      where: { role: UserRole.DOCTOR },
      select: ['id', 'full_name', 'email']
    });
  }
}
