import axios from 'axios';
import { PlcService } from './plc.service';
import { MIXING_REGISTERS } from '../config/registers/mixing.registers';

export class MixingPlcService {
  private currentExecutionBatchId?: number;

  private masterBatchScanned = false;

  constructor(private readonly plc: PlcService) {}

  async processQr(qrId: string) {
    console.log('Mixing QR:', qrId);

    if (!this.masterBatchScanned) {
      return this.processMasterBatch(qrId);
    }

    return this.processIngredient(qrId);
  }

  private async processMasterBatch(qrId: string) {
    const { data } = await axios.post(
      'http://localhost:3000/mixing/scan-master-batch',
      {
        qrId,
      }
    );
    this.currentExecutionBatchId = data.executionBatchId;
    switch (data.result) {
      case 'MASTER_BATCH_NOT_FOUND':
        await this.setBit(MIXING_REGISTERS.WRONG_QR);
        return;

      case 'MASTER_BATCH_ALREADY_USED':
        await this.setBit(MIXING_REGISTERS.PROCESS_ALREADY_DONE);
        return;
    }
    if (data.writeRecipe) {
      await this.writeRecipe(data.recipeName);

      await this.plc.writeRegister(
        MIXING_REGISTERS.TOTAL_STAGES,
        data.totalStages
      );

      await axios.post('http://localhost:3000/mixing/recipe-written', {
        executionBatchId: data.executionBatchId,
      });
    }
    await this.setBit(MIXING_REGISTERS.CORRECT_QR);

    this.masterBatchScanned = true;

    return data;
  }

  private async processIngredient(qrId: string) {
    const { data } = await axios.post(
      'http://localhost:3000/mixing/scan-ingredient',
      {
        qrId,
      }
    );
    switch (data.result) {
      case 'WRONG_QR':
        await this.setBit(MIXING_REGISTERS.WRONG_QR);
        return;

      case 'WRONG_STAGE':
        await this.setBit(MIXING_REGISTERS.WRONG_STAGE);
        return;

      case 'WRONG_BATCH':
        await this.setBit(MIXING_REGISTERS.WRONG_BATCH);
        return;

      case 'PROCESS_ALREADY_DONE':
        await this.setBit(MIXING_REGISTERS.PROCESS_ALREADY_DONE);
        return;

      case 'DUPLICATE_SCAN':
        await this.setBit(MIXING_REGISTERS.QR_NOT_CORRECT);
        return;

      case 'WEIGH_NOT_DONE':
        await this.setBit(MIXING_REGISTERS.WRONG_BATCH);
        return;
    }
    await this.setBit(MIXING_REGISTERS.CORRECT_QR);
    if (data.firstIngredient) {
      await this.plc.writeRegister(MIXING_REGISTERS.STAGE_TIME, data.stageTime);

      await this.plc.writeRegister(
        MIXING_REGISTERS.CURRENT_STAGE,
        data.currentStage
      );
    }
    if (data.scanNext) {
      await this.setBit(MIXING_REGISTERS.SCAN_NEXT);
    }
    if (data.readyToStart) {
      await this.setBit(MIXING_REGISTERS.READY_TO_START);
    }
    return data;
  }

  async onStageComplete() {
    if (!this.currentExecutionBatchId) {
      console.warn('No active mixing batch.');
      return;
    }

    const result = await this.completeStage(this.currentExecutionBatchId);

    if (result.batchCompleted) {
      console.log('Mixing Batch Completed');

      console.log('Final Batch QR:', result.qrId);

      await axios.post('http://localhost:3000/printer/mixing/final-batch', {
        qrId: result.qrId,
        recipeCode: result.recipeCode,
        batchNumber: result.batchNumber,
      });

      this.currentExecutionBatchId = undefined;
      this.masterBatchScanned = false;

      return;
    }

    console.log('Moved to Mixing Stage:', result.nextStageSequence);
  }

  private async completeStage(executionBatchId: number) {
    const { data } = await axios.post(
      'http://localhost:3000/mixing/stage-complete',
      {
        executionBatchId,
      }
    );

    console.log('Mixing Stage Complete:', data);

    return data;
  }

  private async writeRecipe(recipeName: string) {
    await this.plc.writeAscii(
      MIXING_REGISTERS.RECIPE_START,
      recipeName,
      MIXING_REGISTERS.RECIPE_LENGTH
    );
  }

  private async setBit(address: number) {
    console.log(`Setting M${address}`);
    await this.plc.writeCoil(address, true);
  }
}
