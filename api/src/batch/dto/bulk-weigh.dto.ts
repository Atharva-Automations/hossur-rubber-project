import { IsNumber, IsString } from 'class-validator';

export class BulkWeighDto {
  @IsString()
  qrId!: string;

  @IsNumber()
  weight!: number;
}
