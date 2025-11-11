import { Injectable, OnModuleInit } from '@nestjs/common';
import ModbusRTU from 'modbus-serial';

@Injectable()
export class PlcService implements OnModuleInit {
  private client = new ModbusRTU();
  private isConnected = false;

  async onModuleInit() {
    try {
      console.log('🔌 Attempting to connect to PLC...');
      await this.client.connectTCP('192.168.1.5', { port: 502 });
      this.client.setID(1);

      // Quick connectivity test
      const test = await this.client.readHoldingRegisters(0, 1);
      console.log('✅ Connected to PLC, test value:', test.data[0]);

      this.isConnected = true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ PLC connection failed:', error.message);
      } else {
        console.error('❌ PLC connection failed:', String(error));
      }
      this.isConnected = false;
    }
  }

  async readRegisters(start = 0, count = 100) {
    if (!this.isConnected) throw new Error('PLC not connected');
    const res = await this.client.readHoldingRegisters(start, count);
    return res.data.map((v, i) => ({
      address: start + i,
      value: v,
    }));
  }

  async writeRegister(address: number, value: number) {
    if (!this.isConnected) throw new Error('PLC not connected');
    await this.client.writeRegister(address, value);
    return { success: true, address, value };
  }
}
