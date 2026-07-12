import { IsInt, IsString } from 'class-validator';

export class ScanKneaderDto {
  @IsString()
  qrId!: string;
}

export class CompleteStageDto {
  @IsInt()
  executionBatchId!: number;
}

