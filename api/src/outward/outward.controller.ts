import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OutwardService } from './outward.service';

@Controller('outward')
export class OutwardController {
  constructor(private readonly outwardService: OutwardService) {}

  @Post()
  create(@Body() data: any) {
    return this.outwardService.create(data);
  }

  @Get()
  findAll() {
    return this.outwardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.outwardService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.outwardService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.outwardService.remove(id);
  }
}
