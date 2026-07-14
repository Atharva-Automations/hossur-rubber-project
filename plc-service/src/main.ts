import express from 'express';
import { PlcService } from './services/plc.service';
import { ScannerService } from './services/scanner.service';
import { WeighingPlcService } from './services/weighing-plc.service';
import { WeighingListenerService } from './services/weighing-listner.service';
import { KneaderListenerService } from './services/kneader-listner.service';
import { KneaderPlcService } from './services/kneader-plc.service';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3002;

async function bootstrap() {
  const app = express();
  app.use(express.json());

  const plcService = new PlcService();
  await plcService.start();

  const weighingPlcService = new WeighingPlcService(plcService);

  const scannerService = new ScannerService(plcService, weighingPlcService);
  await scannerService.start();

  const weighingListener = new WeighingListenerService(
    plcService,
    weighingPlcService
  );
  weighingListener.start();

  const kneaderPlcService = new KneaderPlcService(plcService);
  const kneaderListener = new KneaderListenerService(
    plcService,
    kneaderPlcService
  );
  kneaderListener.start();

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

  //------------------------------ Debug route-----------------------------------

  app.post('/test/weighing', async (req, res) => {
    try {
      const { qrId } = req.body;

      await scannerService.handleQr(qrId); // or whatever your method is called

      res.json({
        success: true,
      });
    } catch (err: any) {
      console.error(err);

      res.status(500).json({
        message: err.message,
        stack: err.stack,
      });
    }
  });

  app.post('/test/ascii', async (req, res) => {
    try {
      const { address, text, words } = req.body;

      await plcService.writeAscii(address, text, words);

      res.json({
        success: true,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });

  app.post('/test/dword', async (req, res) => {
    try {
      const { address, value } = req.body;

      await plcService.writeDWord(address, value);

      res.json({
        success: true,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });

  app.post('/test/float', async (req, res) => {
    try {
      const { address, value } = req.body;

      await plcService.writeFloat(address, value);

      res.json({
        success: true,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });

  app.post('/test/word', async (req, res) => {
    try {
      const { address, value } = req.body;

      await plcService.writeWord(address, value);

      res.json({
        success: true,
        message: `Written ${value} to D${address}`,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });

  app.post('/test/read-dword', async (req, res) => {
    try {
      const { address } = req.body;

      const value = await plcService.readDWord(address + 4096);

      res.json({
        success: true,
        value,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  });
  //-------------------------------------------------------------------------------
  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
