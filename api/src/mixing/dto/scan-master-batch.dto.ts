import { IsString } from "class-validator";

export class ScanMasterBatchDto {
  @IsString()                                                                                                                                                                  
  qrId!: string;
}