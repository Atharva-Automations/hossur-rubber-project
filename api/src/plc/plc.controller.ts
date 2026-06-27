import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  // BadRequestException,
} from '@nestjs/common';
import { PlcService } from './plc.service';
import { InwardService } from '../inward/inward.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('plc')
export class PlcController {
  constructor(
    private readonly plcService: PlcService,
    private readonly inwardService: InwardService,
    private readonly prisma: PrismaService
  ) {}

  @Get('registers')
  async getRegisters(@Query('start') start = 0, @Query('count') count = 10) {
    return this.plcService.readRegisters(Number(start), Number(count));
  }

  @Post('write')
  async writeRegister(@Body() body: { address: number; value: number }) {
    return this.plcService.writeRegister(body.address, body.value);
  }

  @Post('close-bins')
  async closeAllBins() {
    const start = 4636;
    const end = 4637;
    const writes = [] as any[];
    for (let addr = start; addr <= end; addr++) {
      writes.push(await this.plcService.writeRegister(addr, 1));
    }
    return { ok: true, writes: writes.length };
  }

  @Post('open-bins')
  async openAllBins() {
    const start = 4636;
    const end = 4637;
    const writes = [] as any[];
    for (let addr = start; addr <= end; addr++) {
      writes.push(await this.plcService.writeRegister(addr, 2));
    }
    return { ok: true, writes: writes.length };
  }

  @Get('debug/d350')
  async debugD350() {
    return this.plcService.readD350Debug();
  }

  @Get('debug/d350-d360')
  async debugD350ToD360() {
    return this.plcService.readD350ToD360Debug();
  }

  @Post('test/process-d350')
  async processD350() {
    return this.plcService.processDI350();
  }

  @Get('debug/scan-registers')
  async scanRegisters() {
    return this.plcService.scanAvailableRegisters();
  }
}
