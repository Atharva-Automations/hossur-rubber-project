import axios from 'axios';
import { PlcService } from './plc.service';
import { KNEADER_REGISTERS } from '../config/registers/kneader.registers';

export class KneaderPlcService {
  private currentExecutionBatchId?: number;
  constructor(private readonly plc: PlcService) {}

  async processQr(qrId: string) {
    console.log(`📦 Kneader QR : ${qrId}`);

    const { data } = await axios.post('http://localhost:3000/kneader/scan', {
      qrId,
    });

    this.currentExecutionBatchId = data.executionBatchId;

    console.log('Backend Response', data);

    switch (data.result) {
      case 'WEIGH_NOT_DONE':
        await this.setBit(KNEADER_REGISTERS.WEIGH_NOT_DONE);
        return;

      case 'WRONG_STAGE':
        await this.setBit(KNEADER_REGISTERS.WRONG_STAGE);
        return;

      case 'WRONG_BATCH':
        await this.setBit(KNEADER_REGISTERS.WRONG_BATCH);
        return;

      case 'PROCESS_ALREADY_DONE':
        await this.setBit(KNEADER_REGISTERS.PROCESS_ALREADY_DONE);
        return;

      case 'DUPLICATE_SCAN':
        await this.setBit(KNEADER_REGISTERS.WRONG_QR);
        return;
    }

    if (data.writeRecipe) {
      console.log('Writing Recipe...');

      await this.writeRecipe(data.recipeCode);

      console.log('Writing Stage Timings...');

      await this.writeStageTimings(data.stageTimings);

      await axios.post('http://localhost:3000/kneader/recipe-written', {
        executionBatchId: data.executionBatchId,
      });
    }

    await this.setBit(KNEADER_REGISTERS.CORRECT_QR);

    if (data.scanNext) {
      await this.setBit(KNEADER_REGISTERS.SCAN_NEXT);
    }

    if (data.readyToStart) {
      await this.setBit(KNEADER_REGISTERS.READY_TO_START);
    }

    return data;
  }

  async onStageComplete() {
    if (!this.currentExecutionBatchId) {
      console.warn('No active kneader batch.');
      return;
    }

    const result = await this.completeStage(this.currentExecutionBatchId);

    if (result.batchCompleted) {
      console.log('Kneader Batch Completed');

      await this.plc.writeCoil(KNEADER_REGISTERS.BATCH_COMPLETE, true);

      console.log('Master Batch QR:', result.qrId);

      this.currentExecutionBatchId = undefined;

      return;
    }

    console.log('Moving to next stage:', result.nextStepSequence);
  }

  private async completeStage(executionBatchId: number) {
    const { data } = await axios.post(
      'http://localhost:3000/kneader/stage-complete',
      {
        executionBatchId,
      }
    );

    console.log('Stage Complete Response:', data);

    return data;
  }

  private async writeRecipe(recipeCode: string) {
    await this.plc.writeAscii(
      KNEADER_REGISTERS.RECIPE_START,
      recipeCode,
      KNEADER_REGISTERS.RECIPE_LENGTH
    );
  }

  private async writeStageTimings(timings: number[]) {
    const addresses = [
      KNEADER_REGISTERS.STAGE_1,
      KNEADER_REGISTERS.STAGE_2,
      KNEADER_REGISTERS.STAGE_3,
      KNEADER_REGISTERS.STAGE_4,
      KNEADER_REGISTERS.STAGE_5,
    ];

    for (let i = 0; i < addresses.length; i++) {
      await this.plc.writeRegister(addresses[i], timings[i]);
    }
  }

  private async setBit(address: number) {
    await this.plc.writeCoil(address, true);
  }
}
