import ModbusRTU from 'modbus-serial';

export class PlcService {
  private readonly client = new ModbusRTU();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  async connect() {
    try {
      console.log('🔌 Attempting to connect to PLC...');
      await this.client.connectTCP('192.168.1.1', { port: 502 });
      this.client.setID(1);

      const test = await this.client.readHoldingRegisters(0, 1);
      console.log('✅ Connected to PLC, test value:', test.data[0]);

      this.isConnected = true;
    } catch (error: any) {
      console.error('❌ PLC connection failed:', error?.message || error);
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

  async readD350Debug() {
    if (!this.isConnected) throw new Error('PLC not connected');
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
    if (!this.isConnected) throw new Error('PLC not connected');
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

  async processDI350() {
    if (!this.isConnected) throw new Error('PLC not connected');
    console.log('\n========== 📡 Processing D350 ==========');

    try {
      // Read d350
      const result = await this.client.readHoldingRegisters(350, 1);
      const value = result.data[0];
      console.log('Read d350 value:', value);

      let d540Value = 1;
      let d541Value = 1;

      if (value === 1) {
        d540Value = 2;
        d541Value = 1;
        console.log('D350 = 1: Setting d540 = 2, d541 = 1');
      } else if (value === 2) {
        d540Value = 1;
        d541Value = 2;
        console.log('D350 = 2: Setting d540 = 1, d541 = 2');
      } else {
        console.warn('D350 value is neither 1 nor 2, got:', value);
      }

      // Write d540
      try {
        await this.client.writeRegister(4636, d540Value);
        console.log('✅ Wrote d540 =', d540Value);
      } catch (err: any) {
        console.error('❌ Error writing d540:', err?.message || err);
        throw new Error(`Failed to write d540: ${err?.message || err}`);
      }

      // Write d541
      try {
        await this.client.writeRegister(4637, d541Value);
        console.log('✅ Wrote d541 =', d541Value);
      } catch (err: any) {
        console.error('❌ Error writing d541:', err?.message || err);
        throw new Error(`Failed to write d541: ${err?.message || err}`);
      }

      console.log('========== END Processing D350 ==========\n');

      return {
        d350Input: value,
        d540Output: d540Value,
        d541Output: d541Value,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('========== ERROR Processing D350 ==========');
      console.error('Error:', err?.message || err);
      console.error('========== END ERROR ==========\n');
      throw err;
    }
  }

  async scanAvailableRegisters() {
    if (!this.isConnected) throw new Error('PLC not connected');
    console.log('\n========== 📡 Scanning Available Registers ==========');

    const results: {
      [key: number]: { value: number; success: boolean; error?: string };
    } = {};

    // Test ranges commonly used
    const testRanges = [
      { start: 0, count: 50, label: 'Range 0-50' },
      { start: 100, count: 50, label: 'Range 100-150' },
      { start: 200, count: 50, label: 'Range 200-250' },
      { start: 300, count: 100, label: 'Range 300-400' },
      { start: 4596, count: 4996, label: 'Range 500-600' },
    ];

    for (const range of testRanges) {
      try {
        console.log(`\nTesting ${range.label}...`);
        const regs = await this.client.readHoldingRegisters(
          range.start,
          range.count
        );
        console.log(
          `✅ ${range.label} - accessible (read ${regs.data.length} registers)`
        );

        // Log first 5 non-zero values
        const nonZero = regs.data
          .map((v, i) => ({ addr: range.start + i, val: v }))
          .filter((x) => x.val !== 0)
          .slice(0, 5);

        if (nonZero.length > 0) {
          console.log(
            `   Non-zero values: ${nonZero
              .map((x) => `d${x.addr}=${x.val}`)
              .join(', ')}`
          );
        }
      } catch (err: any) {
        console.warn(
          `❌ ${range.label} - not accessible: ${err?.message || err}`
        );
      }
    }

    console.log('\n========== END Scan ==========\n');
    return { scanned: true, timestamp: new Date().toISOString() };
  }
}
