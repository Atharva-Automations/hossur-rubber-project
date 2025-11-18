// src/batch/dto/scan.dto.ts
import { IsString, MinLength } from 'class-validator';

export class ScanDto {
  @IsString()
  @MinLength(1)
  qrId!: string;
}
