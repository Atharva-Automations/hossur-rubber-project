import { IsNumber, IsString } from 'class-validator';

export class CompleteWeighingDto {
  @IsString()
  qrId!: string;

  @IsNumber()
  weight!: number;
}
