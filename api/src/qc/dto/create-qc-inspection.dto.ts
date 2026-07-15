import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQcInspectionDto {
  @IsInt()
  finalBatchId!: number;

  @IsOptional()
  @IsNumber()
  hardnessActual?: number;
  @IsOptional()
  @IsNumber()
  tensileActual?: number;
  @IsOptional()
  @IsNumber()
  elongationActual?: number;
  @IsOptional()
  @IsNumber()
  specificGravityActual?: number;
  @IsOptional()
  @IsNumber()
  compressionSetActual?: number;
  @IsOptional()
  @IsString()
  remarks?: string;
}
