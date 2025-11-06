import { IsString, IsNumber, Min } from 'class-validator';

export class AssignBinDto {
  @IsString()
  binNumber!: string;

  @IsNumber()
  ingredientId!: number;

  @IsNumber()
  @Min(0)
  minQuantity!: number;

  @IsNumber()
  @Min(1)
  maxQuantity!: number;
}
