import { IsInt } from "class-validator";

export class CompleteStageDto {
  @IsInt()
  executionBatchId!: number;
}
