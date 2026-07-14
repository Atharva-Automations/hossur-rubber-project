import { IsString } from 'class-validator';

export class ScanIngredientDto {
  @IsString()
  qrId!: string;
}
