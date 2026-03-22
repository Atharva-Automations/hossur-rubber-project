import express from 'express';
import { PlcService } from './plc.service';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3002;

const app = express();
app.use(express.json());

const plcService = new PlcService();

// Health check
app.get('/health', (req, res) => {
  res.send('PLC Service Running');
});

// Read registers
app.get('/plc/read', async (req, res) => {
  try {
    const data = await plcService.readRegisters(0, 10);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Write register
app.post('/plc/write', async (req, res) => {
  try {
    const { address, value } = req.body;
    const result = await plcService.writeRegister(address, value);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Debug route (optional but useful)
app.get('/plc/debug/d350', async (req, res) => {
  try {
    const result = await plcService.readD350Debug();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
