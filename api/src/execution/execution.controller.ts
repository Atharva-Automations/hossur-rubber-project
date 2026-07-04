import { Body, Controller, Post } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto } from './dto/create-execution.dto';

@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  create(@Body() dto: CreateExecutionDto) {
    return this.executionService.create(dto);
  }
}
