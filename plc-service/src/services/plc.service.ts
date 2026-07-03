import ModbusRTU from 'modbus-serial';
import { PRODUCTION_PLC } from '../config/production.plc';
import { PRODUCTION_REGISTERS } from '../config/registers/production.registers';

export class PlcService {
  // --------------------------------------------------------------------------
  // Properties
  private readonly client = new ModbusRTU();
  private isConnected = false;

  D_OFFSET = 4096;
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Lifecycle
  async start(): Promise<void> {
    await this.connect();
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

      const test = await this.client.readHoldingRegisters(0, 1);
      console.log('✅ Connected to PLC, test value:', test.data[0]);

      this.isConnected = true;
    } catch (error: any) {
      console.error('❌ PLC connection failed:', error?.message || error);
      this.isConnected = false;
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('PLC not connected');
    }
  }
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Read Operations
  async readRegisters(start = 0, count = 100) {
    this.ensureConnected();
    const res = await this.client.readHoldingRegisters(start, count);
    return res.data.map((v, i) => ({
      address: start + i,
      value: v,
    }));
  }

  async readCoils(start: number, count: number) {
    this.ensureConnected();

    const res = await this.client.readCoils(start, count);

    return res.data;
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

    await this.client.writeCoil(address, value);

    return {
      success: true,
      address,
      value,
    };
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

  // --------------------------------------------------------------------------
  // Debug (Temporary)
  async readD350Debug() {
    this.ensureConnected();
    console.log('\n========== 📡 DEBUG: Reading D350 ==========');
    const result = await this.client.readHoldingRegisters(350, 1);
    const value = result.data[0];
    const asciiChar = this.decodeSingleRegister(value);
    console.log('Raw value from d350:', value);
    console.log('Type:', typeof value);
    console.log('Hex:', '0x' + value.toString(16));
    console.log('Binary:', value.toString(2));
    console.log('As ASCII char:', asciiChar);
    console.log('========== END D350 DEBUG ==========\n');
    return {
      address: 350,
      value,
      hex: '0x' + value.toString(16),
      ascii: asciiChar,
      timestamp: new Date().toISOString(),
    };
  }

  async readD350ToD360Debug() {
    this.ensureConnected();
    console.log('\n========== 📡 DEBUG: Reading D350-D360 ==========');
    const result = await this.client.readHoldingRegisters(350, 11);
    const parsed = result.data.map((v, i) => ({
      address: 350 + i,
      value: v,
      hex: '0x' + v.toString(16),
      ascii: v > 31 && v < 127 ? String.fromCharCode(v) : '?',
    }));
    console.log('Registers:', parsed);
    const qrString = parsed.map((p) => p.ascii).join('');
    console.log('Parsed as string:', qrString);
    console.log('========== END D350-D360 DEBUG ==========\n');
    return {
      registers: parsed,
      parsedString: qrString,
      timestamp: new Date().toISOString(),
    };
  }

  // async scanAvailableRegisters() {
  //   this.ensureConnected();
  //   console.log('\n========== 📡 Scanning Available Registers ==========');

  //   const results: {
  //     [key: number]: { value: number; success: boolean; error?: string };
  //   } = {};

  //   // Test ranges commonly used
  //   const testRanges = [
  //     { start: 0, count: 50, label: 'Range 0-50' },
  //     { start: 100, count: 50, label: 'Range 100-150' },
  //     { start: 200, count: 50, label: 'Range 200-250' },
  //     { start: 300, count: 100, label: 'Range 300-400' },
  //     { start: 4596, count: 4996, label: 'Range 500-600' },
  //   ];

  //   for (const range of testRanges) {
  //     try {
  //       console.log(`\nTesting ${range.label}...`);
  //       const regs = await this.client.readHoldingRegisters(
  //         range.start,
  //         range.count
  //       );
  //       console.log(
  //         `✅ ${range.label} - accessible (read ${regs.data.length} registers)`
  //       );

  //       // Log first 5 non-zero values
  //       const nonZero = regs.data
  //         .map((v, i) => ({ addr: range.start + i, val: v }))
  //         .filter((x) => x.val !== 0)
  //         .slice(0, 5);

  //       if (nonZero.length > 0) {
  //         console.log(
  //           `   Non-zero values: ${nonZero
  //             .map((x) => `d${x.addr}=${x.val}`)
  //             .join(', ')}`
  //         );
  //       }
  //     } catch (err: any) {
  //       console.warn(
  //         `❌ ${range.label} - not accessible: ${err?.message || err}`
  //       );
  //     }
  //   }

  //   console.log('\n========== END Scan ==========\n');
  //   return { scanned: true, timestamp: new Date().toISOString() };
  // }
  // --------------------------------------------------------------------------
}
