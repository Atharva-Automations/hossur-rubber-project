import ModbusRTU from 'modbus-serial';
import { PRODUCTION_PLC } from '../config/production.plc';
import { PRODUCTION_REGISTERS } from '../config/registers/production.registers';
import { MIXING_PLC } from '../config/mixing.plc';
import { PlcType } from '../config/plc-type';

interface PlcConfig {
  host: string;
  port: number;
  unitId: number;
  timeout: number;
}

export class PlcService {
  // --------------------------------------------------------------------------
  // Properties
  private readonly clients = {
    [PlcType.PRODUCTION]: new ModbusRTU(),
    [PlcType.MIXING]: new ModbusRTU(),
  };

  private readonly connected = {
    [PlcType.PRODUCTION]: false,
    [PlcType.MIXING]: false,
  };

  private readonly D_OFFSET = 4096;
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Lifecycle
  async start(): Promise<void> {
    await this.connect(PlcType.PRODUCTION, PRODUCTION_PLC);

    await this.connect(PlcType.MIXING, MIXING_PLC);
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Connection
  private getClient(type: PlcType): ModbusRTU {
    return this.clients[type];
  }

  private ensureConnected(type: PlcType) {
    if (!this.connected[type]) {
      throw new Error(`${type} PLC not connected`);
    }
  }

  private async connect(type: PlcType, config: PlcConfig) {
    try {
      console.log(`Connecting ${type} PLC...`);

      const client = this.getClient(type);

      await client.connectTCP(config.host, {
        port: config.port,
      });

      client.setID(config.unitId);
      client.setTimeout(config.timeout);

      this.connected[type] = true;

      console.log(`${type} PLC Connected`);
    } catch (err: any) {
      this.connected[type] = false;

      console.error(err.message);
    }
  }

  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Read Operations
  async readRegisters(start = 0, count = 100, plc: PlcType = PlcType.PRODUCTION) {
    this.ensureConnected(plc);
    const client = this.getClient(plc);
    const res = await client.readHoldingRegisters(start + 4096, count);
    return res.data.map((v, i) => ({
      address: start + i,
      value: v,
    }));
  }

  async readWords(address: number, count: number, plc: PlcType = PlcType.PRODUCTION): Promise<number[]> {
    this.ensureConnected(plc);
    const client = this.getClient(plc);
    const res = await client.readHoldingRegisters(address + 4096, count);
    return res.data;
  }

  async readCoils(
    start: number,
    count: number,
    plc: PlcType = PlcType.PRODUCTION
  ) {
    this.ensureConnected(plc);

    const client = this.getClient(plc);

    const res = await client.readCoils(start + 2048, count);

    return res.data;
  }

  async readDWord(address: number, plc: PlcType = PlcType.PRODUCTION): Promise<number> {
    this.ensureConnected(plc);
    const client = this.getClient(plc);
    const result = await client.readHoldingRegisters(address + 4096, 2);

    const low = result.data[0];
    const high = result.data[1];

    return high * 65536 + low;
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Write Operations
  async writeRegister(address: number, value: number, plc: PlcType = PlcType.PRODUCTION) {
    this.ensureConnected(plc);
    const client = this.getClient(plc);
    await client.writeRegister(this.D_OFFSET + address, value);
    return { success: true, address, value };
  }

  async writeCoil(address: number, value: boolean, plc: PlcType = PlcType.PRODUCTION) {
    this.ensureConnected(plc);
    const client = this.getClient(plc);

    await client.writeCoil(address + 2048, value);

    return {
      success: true,
      address,
      value,
    };
  }

  async writeWord(address: number, value: number, plc: PlcType = PlcType.PRODUCTION) {
    return this.writeRegister(address, value, plc);
  }

  async writeWords(address: number, values: number[], plc: PlcType = PlcType.PRODUCTION) {
    this.ensureConnected(plc);
    const client = this.getClient(plc);

    await client.writeRegisters(address + this.D_OFFSET, values);

    return true;
  }

  async writeFloat(address: number, value: number, plc: PlcType = PlcType.PRODUCTION) {
    const buffer = Buffer.alloc(4);

    buffer.writeFloatBE(value);

    const high = buffer.readUInt16BE(0);
    const low = buffer.readUInt16BE(2);

    await this.writeWords(address, [low, high], plc);
  }

  async writeDWord(address: number, value: number, plc: PlcType = PlcType.PRODUCTION) {
    const high = (value >> 16) & 0xffff;
    const low = value & 0xffff;

    await this.writeWords(address, [low, high], plc);
  }

  async writeAscii(address: number, text: string, words: number, plc: PlcType = PlcType.PRODUCTION) {
    const buffer = Buffer.alloc(words * 2);

    buffer.write(text);

    const registers: number[] = [];

    for (let i = 0; i < words; i++) {
      registers.push(buffer.readUInt16BE(i * 2));
    }

    await this.writeWords(address, registers, plc);
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
