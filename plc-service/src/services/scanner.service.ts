import axios from 'axios';

import { PlcService } from './plc.service';
import { PRODUCTION_REGISTERS } from '../config/registers/production.registers';
import { WeighingPlcService } from './weighing-plc.service';

export class ScannerService {
  constructor(
    private readonly plcService: PlcService,
    private readonly weighingPlcService: WeighingPlcService
  ) {}

  private processing = false;

  async start(): Promise<void> {
    console.log('📷 Scanner Service Started');

    setInterval(async () => {
      if (this.processing) {
        return;
      }

      this.processing = true;

      try {
        const qrCode = await this.readScannedQRCode();

        if (qrCode) {
          const result = await this.sendQRCodeToBackend(qrCode);

          if (result.payload) {
            await this.weighingPlcService.process(result.payload);
          }

          await this.triggerScanSuccess();

          console.log(result);
        }
      } catch (error) {
        console.error('Scanner Error:', error);

        await this.triggerScanFailure();
      } finally {
        this.processing = false;
      }
    }, 200);
  }

  async isScanAvailable(): Promise<boolean> {
    const coils = await this.plcService.readCoils(
      PRODUCTION_REGISTERS.SCANNER.TRIGGER,
      1
    );

    return coils[0];
  }

  async readQRCodeRegisters(): Promise<number[]> {
    const registers = await this.plcService.readRegisters(
      PRODUCTION_REGISTERS.SCANNER.QR_START,
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
    // console.log('Scanned QR Code Registers:', registers);

    const qrCode = this.decodeQRCode(registers);

    await this.plcService.writeCoil(
      PRODUCTION_REGISTERS.SCANNER.TRIGGER,
      false
    );

    return qrCode;
  }

  async handleQr(qrId: string) {
    const response = await axios.post('http://localhost:3000/scanner/scan', {
      qrId,
    });

    await this.weighingPlcService.process(response.data.payload);
  }

  private async triggerScanSuccess() {
    console.log('turning m2 on');
    await this.plcService.writeCoil(PRODUCTION_REGISTERS.SCANNER.SUCCESS, true);

    console.log('m2 is on');

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async triggerScanFailure() {
    await this.plcService.writeCoil(PRODUCTION_REGISTERS.SCANNER.FAILURE, true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    await this.plcService.writeCoil(
      PRODUCTION_REGISTERS.SCANNER.FAILURE,
      false
    );
  }

  private async sendQRCodeToBackend(qrCode: string) {
    const response = await axios.post('http://localhost:3000/scanner/scan', {
      qrId: qrCode,
    });

    console.log(response.data);

    return response.data;
  }
}
