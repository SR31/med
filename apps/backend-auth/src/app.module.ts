import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'med',
      password: process.env.DB_PASS || 'med',
      database: process.env.DB_NAME || 'med',
      entities: [User],
      synchronize: true
    }),
    AuthModule
  ]
})
export class AppModule {}
