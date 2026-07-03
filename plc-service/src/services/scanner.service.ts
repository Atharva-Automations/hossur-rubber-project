import axios from 'axios';

import { PlcService } from './plc.service';
import { PRODUCTION_REGISTERS } from '../config/registers/production.registers';
import { PRODUCTION_PLC } from '../config/production.plc';

const M_OFFSET = PRODUCTION_PLC.offsets.M;
const D_OFFSET = PRODUCTION_PLC.offsets.D;

export class ScannerService {
  constructor(private readonly plcService: PlcService) {}

  async start(): Promise<void> {
    console.log('📷 Scanner Service Started');

    setInterval(async () => {
      try {
        const qrCode = await this.readScannedQRCode();

        if (qrCode) {
          const result = await this.sendQRCodeToBackend(qrCode);

          await this.plcService.setBinLoading(result.binNumber);

          console.log(result);
        }
      } catch (error) {
        console.error('Scanner Error:', error);
      }
    }, 200);
  }

  async isScanAvailable(): Promise<boolean> {
    const coils = await this.plcService.readCoils(
      M_OFFSET + PRODUCTION_REGISTERS.SCANNER.TRIGGER,
      1
    );

    return coils[0];
  }

  async readQRCodeRegisters(): Promise<number[]> {
    const registers = await this.plcService.readRegisters(
      D_OFFSET + PRODUCTION_REGISTERS.SCANNER.QR_START,
      PRODUCTION_REGISTERS.SCANNER.QR_LENGTH
    );

    return registers.map((register) => register.value);
  }

  decodeQRCode(registers: number[]): string {
    let qr = '';

    for (const value of registers) {
      const low = value & 0xff;
      const high = (value >> 8) & 0xff;

      if (low !== 0) qr += String.fromCharCode(low);
      if (high !== 0) qr += String.fromCharCode(high);
    }

    return qr.replace(/\0/g, '').trim();
  }

  async readScannedQRCode(): Promise<string | null> {
    const scanAvailable = await this.isScanAvailable();

    if (!scanAvailable) {
      return null;
    }

    const registers = await this.readQRCodeRegisters();

    const qrCode = this.decodeQRCode(registers);

    // Tell PLC that scan has been consumed
    await this.plcService.writeCoil(
      PRODUCTION_PLC.offsets.M + PRODUCTION_REGISTERS.SCANNER.TRIGGER,
      false
    );

    return qrCode;
  }

  private async sendQRCodeToBackend(qrCode: string) {
    const response = await axios.post(
      'http://localhost:3000/production/scan-qr',
      {
        qrCode,
      }
    );

    return response.data;
  }
}
