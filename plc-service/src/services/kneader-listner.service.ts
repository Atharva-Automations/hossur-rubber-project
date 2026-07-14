import { PlcService } from './plc.service';
import { KNEADER_REGISTERS } from '../config/registers/kneader.registers';
import { decodePLCAscii } from '../utils/decode-plc-ascii';
import { KneaderPlcService } from './kneader-plc.service';

export class KneaderListenerService {
  private timer?: NodeJS.Timeout;
  private lastScanState = false;
  private lastStageCompleteState = false;
  private processingStageComplete = false;

  constructor(
    private readonly plc: PlcService,
    private readonly kneader: KneaderPlcService
  ) {}

  start() {
    console.log('Kneader Listener Service started.');
    this.timer = setInterval(async () => {
      try {
        const scanTrigger = await this.plc.readCoils(
          KNEADER_REGISTERS.SCAN_TRIGGER,
          1
        );

        const stageComplete = await this.plc.readCoils(
          KNEADER_REGISTERS.STAGE_COMPLETE,
          1
        );

        const scanState = scanTrigger[0];
        const stageState = stageComplete[0];
        // console.log(`M614 State: ${stageState}`);

        // console.log(`M600: ${scanState} | M614: ${stageState}`);

        if (scanState && !this.lastScanState) {
          const registers = await this.plc.readWords(
            KNEADER_REGISTERS.QR_START,
            KNEADER_REGISTERS.QR_LENGTH
          );

          const qrId = decodePLCAscii(registers);

          try {
            console.log(`📥 Kneader QR : ${qrId}`);
            await this.kneader.processQr(qrId.trim());
          } finally {
            await this.plc.writeCoil(KNEADER_REGISTERS.SCAN_TRIGGER, false);
          }
        }

        this.lastScanState = scanState;
        if (
          stageState &&
          !this.lastStageCompleteState &&
          !this.processingStageComplete
        ) {
          this.processingStageComplete = true;

          console.log('🏁 Stage Complete Detected');

          try {
            await this.kneader.onStageComplete();
          } catch (err) {
            console.error(err);
          }
        }

        if (!stageState) {
          this.processingStageComplete = false;
        }

        this.lastStageCompleteState = stageState;

        this.lastStageCompleteState = stageState;
      } catch (err) {
        console.error(err);
      }
    }, 200);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}
