import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';

@ApiTags('Медицинская карта')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly service: RecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить медицинские записи текущего пациента' })
  myRecords(@Req() req: any) {
    return this.service.findMine(req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Создать запись в медицинской карте пациента' })
  create(@Req() req: any, @Body() dto: CreateRecordDto) {
    return this.service.create(req.user, dto);
  }
}
