import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PlcService } from './plc.service';

@Controller('plc')
export class PlcController {
  constructor(private readonly plcService: PlcService) {}

  @Get('registers')
  async getRegisters(@Query('start') start = 0, @Query('count') count = 10) {
    return this.plcService.readRegisters(Number(start), Number(count));
  }

  @Post('write')
  async writeRegister(@Body() body: { address: number; value: number }) {
    return this.plcService.writeRegister(body.address, body.value);
  }
}
