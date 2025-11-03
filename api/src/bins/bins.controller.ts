import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { BinsService } from './bins.service';

@Controller('bins')
export class BinsController {
  constructor(private readonly binsService: BinsService) {}

  @Post()
  assignBin(@Body() data: any) {
    return this.binsService.assignBin(data);
  }

  @Get()
  findAll() {
    return this.binsService.findAll();
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.binsService.delete(+id);
  }
}
