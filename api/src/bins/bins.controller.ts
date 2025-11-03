import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
} from '@nestjs/common';
import { BinService } from './bins.service';

@Controller('bins')
export class BinController {
  constructor(private readonly binService: BinService) {}

  @Post()
  create(@Body() body: any) {
    return this.binService.create(body);
  }

  @Get()
  findAll() {
    return this.binService.findAll();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.binService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.binService.delete(id);
  }
}
