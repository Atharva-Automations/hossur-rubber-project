// import { Controller, Get, Post, Body, Param } from '@nestjs/common';
// import { InventoryService } from './inventory.service';

// @Controller('inventory')
// export class InventoryController {
//   constructor(private readonly service: InventoryService) {}

//   @Post('inward')
//   inward(@Body() dto: any) {
//     return this.service.inward(dto);
//   }

//   @Post('outward')
//   outward(@Body() dto: any) {
//     return this.service.outward(dto);
//   }

//   @Get('lots')
//   getLots() {
//     return this.service.getLots();
//   }

//   @Get('ledger/:lotId')
//   getLedger(@Param('lotId') lotId: string) {
//     return this.service.getLedger(+lotId);
//   }
// }
