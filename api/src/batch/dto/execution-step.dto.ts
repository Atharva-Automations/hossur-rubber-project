// src/batch/dto/execution-step.dto.ts

import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsNotEmpty,
  IsInt,
} from 'class-validator';

export class StartStepDto {
  productExecutionId!: number;
  batchStepId!: number;
  source?: 'PLC' | 'UI';
}

export class ScanExecutionDto {
  @IsString()
  qrId!: string;

  @IsOptional()
  @IsIn(['PLC', 'UI', 'AUTO_TIMER'])
  source?: 'PLC' | 'UI' | 'AUTO_TIMER';
}

export class CompleteStepDto {
  @IsNumber()
  productExecutionId!: number;

  @IsNumber()
  batchStepId!: number;

  @IsOptional()
  source?: string;
}

export class FinalizeProductDto {
  @IsInt()
  @IsNotEmpty()
  productExecutionId!: number;
}
