import { PlcService } from './plc.service';
import { WEIGHING_REGISTERS } from '../config/registers/weighing.registers';
import axios from 'axios';
import { WeighingPlcService } from './weighing-plc.service';

export class WeighingListenerService {
  private timer?: NodeJS.Timeout;
  private lastM3State = false;

  constructor(
    private readonly plcService: PlcService,
    private readonly weighingPlcService: WeighingPlcService
  ) {}

  start() {
    console.log('Weighing Listener Service started.');
    this.timer = setInterval(async () => {
      try {
        const current = (
          await this.plcService.readCoils(
            WEIGHING_REGISTERS.WEIGHING_DONE_BIT,
            1
          )
        )[0];

        // Detect M3 OFF -> ON (Rising Edge)
        if (!this.lastM3State && current) {
          const qrId = this.weighingPlcService.getCurrentQr();

          if (!qrId) {
            this.lastM3State = current;
            return;
          }

          const rawWeight = await this.plcService.readDWord(
            WEIGHING_REGISTERS.ACTUAL_WEIGHT
          );

          const actualWeight = rawWeight / 10;

          console.log(`Weight Captured: ${actualWeight} g for QR ${qrId}`);

          const { data } = await axios.post(
            'http://localhost:3000/weighing/complete',
            {
              qrId,
              weight: actualWeight,
            }
          );

          await this.plcService.writeCoil(
            WEIGHING_REGISTERS.WEIGHING_DONE_BIT,
            false
          );

          this.weighingPlcService.clearCurrentQr();

          if (data.isLastIngredient) {
            await new Promise((resolve) => setTimeout(resolve, 10000));

            await this.weighingPlcService.closeAllBins();
          }

          console.log('Ingredient completed.');
        }

        // Update previous state
        this.lastM3State = current;
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
