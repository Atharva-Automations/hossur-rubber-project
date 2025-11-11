import ModbusRTU from 'modbus-serial';

const client = new ModbusRTU();
const PLC_IP = '192.168.1.5'; // ⚠️ Change to your PLC’s IP
const PLC_PORT = 502;

// Try connecting
(async () => {
  try {
    console.log('🔌 Connecting to PLC...');
    await client.connectTCP(PLC_IP, { port: PLC_PORT });
    client.setID(1); // Slave ID (usually 1 for DVP series)

    console.log('✅ Connected to PLC');

    // Example 1: Read Holding Registers (e.g., D0, D1)
    // In Delta Modbus mapping: D0 = 40001
    const reg = await client.readHoldingRegisters(0, 4);
    console.log('📥 Read Registers:', reg.data);

    // Example 2: Write a value to D2 (address 40003)
    const valueToWrite = 1234;
    await client.writeRegister(2, valueToWrite);
    console.log(`📤 Wrote value ${valueToWrite} to D2`);

    // Example 3: Verify write
    const verify = await client.readHoldingRegisters(2, 1);
    console.log('✅ Verified D2 value:', verify.data[0]);

    client.close();
    console.log('🔒 Connection closed');
  } catch (err) {
    console.error('❌ Error communicating with PLC:', err);
  }
})();
