import { Injectable } from '@nestjs/common';

import { TscPrinterClient } from '../transport/tsc-printer.client';
import { buildMixingLabel } from '../tspl/mixing.template';
import { MixingLabelData } from '../types/mixing-label-data';
import { PRINTERS } from '../config/printer.config';
// import { TscPrinterClient } from '../transport/tsc-printer.client';

@Injectable()
export class MixingPrinterService {
  constructor(private readonly tscPrinterClient: TscPrinterClient) {}

  async printMasterBatch(
    data: Omit<MixingLabelData, 'labelType'>
  ): Promise<void> {
    const tspl = buildMixingLabel({
      ...data,
      labelType: 'MASTER',
    });

    const printer = PRINTERS.mixing;

    await this.tscPrinterClient.send(printer.ip, printer.port, tspl);
  }

  async printFinalBatch(
    data: Omit<MixingLabelData, 'labelType'>
  ): Promise<void> {
    const tspl = buildMixingLabel({
      ...data,
      labelType: 'FINAL',
    });

    const printer = PRINTERS.mixing;

    await this.tscPrinterClient.send(printer.ip, printer.port, tspl);
  }
}
