import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CompleteAppointmentDto } from './dto/complete-appointment.dto';

@ApiTags('Записи на приём')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список записей текущего пользователя' })
  list(@Req() req: any) {
    return this.service.list(req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новую запись на приём' })
  create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    return this.service.create(req.user, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Завершить приём с диагнозом (только для врача)' })
  complete(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteAppointmentDto
  ) {
    return this.service.complete(req.user, id, dto);
  }
}
