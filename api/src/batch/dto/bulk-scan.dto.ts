import { IsString } from 'class-validator';

export class BulkScanDto {
  @IsString()
  qrId!: string;
}
