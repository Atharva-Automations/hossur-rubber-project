import { PlcService } from './plc.service';
import { MIXING_REGISTERS } from '../config/registers/mixing.registers';
import { decodePLCAscii } from '../utils/decode-plc-ascii';
import { MixingPlcService } from './mixing-plc.service';
import { PlcType } from '../config/plc-type';

export class MixingListenerService {
  private timer?: NodeJS.Timeout;

  private lastScanState = false;

  private lastStageCompleteState = false;

  constructor(
    private readonly plc: PlcService,
    private readonly mixing: MixingPlcService
  ) {}

  start() {
    console.log('Mixing listener running');
    this.timer = setInterval(async () => {
      try {
        const scanTrigger = await this.plc.readCoils(
          MIXING_REGISTERS.SCAN_TRIGGER,
          1,
          PlcType.MIXING
        );

        // console.log("M0 =", scanTrigger[0]);
        const res = await (this.plc as any).client.readCoils(2048, 1);
        console.log(res.data[0]);

        const stageComplete = await this.plc.readCoils(
          MIXING_REGISTERS.STAGE_COMPLETE,
          1,
          PlcType.MIXING
        );

        const scanState = scanTrigger[0];
        const stageState = stageComplete[0];

        if (scanState && !this.lastScanState) {
          const registers = await this.plc.readWords(
            MIXING_REGISTERS.QR_START,
            MIXING_REGISTERS.QR_LENGTH,
            PlcType.MIXING
          );

          const qrId = decodePLCAscii(registers);

          console.log('Mixing QR:', qrId);

          await this.mixing.processQr(qrId.trim());
        }

        this.lastScanState = scanState;

        if (stageState && !this.lastStageCompleteState) {
          console.log('Mixing Stage Complete');

          await this.mixing.onStageComplete();
        }

        this.lastStageCompleteState = stageState;
      } catch (err) {
        console.error(err);
      }
    }, 200);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
