import ModbusRTU from 'modbus-serial';
import { PRODUCTION_PLC } from '../config/production.plc';
import { PRODUCTION_REGISTERS } from '../config/registers/production.registers';
import { MIXING_PLC } from '../config/mixing.plc';

export class PlcService {
  // --------------------------------------------------------------------------
  // Properties
  private readonly client = new ModbusRTU();
  private readonly mixingClient = new ModbusRTU();
  private isConnected = false;
  private isMixingConnected = false;

  D_OFFSET = 4096;
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Lifecycle
  async start(): Promise<void> {
    await this.connect();
    await this.connectMixing();
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Connection
  private async connect() {
    try {
      console.log('🔌 Attempting to connect to PLC...');
      await this.client.connectTCP(PRODUCTION_PLC.host, {
        port: PRODUCTION_PLC.port,
      });
      this.client.setID(PRODUCTION_PLC.unitId);
      this.client.setTimeout(PRODUCTION_PLC.timeout);

      // const test = await this.client.readHoldingRegisters(0, 1);
      console.log('✅ Connected to PLC');

      this.isConnected = true;
    } catch (error: any) {
      console.error('❌ PLC connection failed:', error?.message || error);
      this.isConnected = false;
    }
  }

  private async connectMixing() {
    try {
      console.log('🔌 Connecting to Mixing PLC...');

      await this.mixingClient.connectTCP(MIXING_PLC.host, {
        port: MIXING_PLC.port,
      });

      this.mixingClient.setID(MIXING_PLC.unitId);
      this.mixingClient.setTimeout(MIXING_PLC.timeout);

      console.log('✅ Connected to Mixing PLC');

      this.isMixingConnected = true;
    } catch (error: any) {
      console.error(
        '❌ Mixing PLC connection failed:',
        error?.message || error
      );

      this.isMixingConnected = false;
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Production PLC not connected');
    }
    if (!this.isMixingConnected) {
      throw new Error('Mixing PLC not connected');
    }
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Read Operations
  async readRegisters(start = 0, count = 100) {
    this.ensureConnected();
    const res = await this.client.readHoldingRegisters(start + 4096, count);
    return res.data.map((v, i) => ({
      address: start + i,
      value: v,
    }));
  }

  async readWords(address: number, count: number): Promise<number[]> {
    this.ensureConnected();

    const res = await this.client.readHoldingRegisters(address + 4096, count);

    return res.data;
  }

  async readCoils(start: number, count: number) {
    this.ensureConnected();

    const res = await this.client.readCoils(start + 2048, count);

    return res.data;
  }

  async readDWord(address: number): Promise<number> {
    this.ensureConnected();

    const result = await this.client.readHoldingRegisters(address + 4096, 2);

    const low = result.data[0];
    const high = result.data[1];

    return high * 65536 + low;
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Write Operations
  async writeRegister(address: number, value: number) {
    this.ensureConnected();
    await this.client.writeRegister(this.D_OFFSET + address, value);
    return { success: true, address, value };
  }

  async writeCoil(address: number, value: boolean) {
    this.ensureConnected();

    await this.client.writeCoil(address + 2048, value);

    return {
      success: true,
      address,
      value,
    };
  }

  async writeWord(address: number, value: number) {
    return this.writeRegister(address, value);
  }

  async writeWords(address: number, values: number[]) {
    this.ensureConnected();

    await this.client.writeRegisters(address + this.D_OFFSET, values);

    return true;
  }

  async writeFloat(address: number, value: number) {
    const buffer = Buffer.alloc(4);

    buffer.writeFloatBE(value);

    const high = buffer.readUInt16BE(0);
    const low = buffer.readUInt16BE(2);

    await this.writeWords(address, [low, high]);
  }

  async writeDWord(address: number, value: number) {
    const high = (value >> 16) & 0xffff;
    const low = value & 0xffff;

    await this.writeWords(address, [low, high]);
  }

  async writeAscii(address: number, text: string, words: number) {
    const buffer = Buffer.alloc(words * 2);

    buffer.write(text);

    const registers: number[] = [];

    for (let i = 0; i < words; i++) {
      registers.push(buffer.readUInt16BE(i * 2));
    }

    await this.writeWords(address, registers);
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Production Operations
  decodeSingleRegister(value: number): string {
    // Convert number to ASCII characters (corrected byte order)
    const bytes = [];
    let temp = value;

    while (temp > 0) {
      bytes.push(temp & 0xff); // Changed: push instead of unshift
      temp = temp >> 8;
    }

    return bytes.map((b) => String.fromCharCode(b)).join('');
  }

  async setBinLoading(binNumber: number): Promise<void> {
    const register =
      PRODUCTION_REGISTERS.BIN_LOADING[
        binNumber as keyof typeof PRODUCTION_REGISTERS.BIN_LOADING
      ];

    if (!register) {
      throw new Error(`Invalid bin number: ${binNumber}`);
    }

    await this.writeRegister(register, 2);

    console.log(`✅ Bin ${binNumber} loading signal sent (D${register} = 2)`);
  }
  // --------------------------------------------------------------------------
}
