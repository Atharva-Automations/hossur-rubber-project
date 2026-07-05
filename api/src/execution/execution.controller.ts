import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto } from './dto/create-execution.dto';

@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  create(@Body() dto: CreateExecutionDto) {
    return this.executionService.create(dto);
  }

  @Get(':id/qrs')
  findExecutionQrs(@Param('id', ParseIntPipe) id: number) {
    return this.executionService.findExecutionQrs(id);
  }
}
