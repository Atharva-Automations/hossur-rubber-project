import { Injectable } from '@nestjs/common';
import { TscPrinterClient } from '../transport/tsc-printer.client';
import { buildQcLabel, QcLabelData } from '../tspl/qc.template';
import { PRINTERS } from '../config/printer.config';

@Injectable()
export class QcPrinterService {
  constructor(private readonly tscPrinterClient: TscPrinterClient) {}

  async printQcLabel(
    data: Omit<QcLabelData, 'qcResult'> & { qcResult: 'PASS' | 'FAIL' }
  ): Promise<void> {
    const tspl = buildQcLabel(data);
    const printer = PRINTERS.mixing;
    await this.tscPrinterClient.send(printer.ip, printer.port, tspl);
  }
}
