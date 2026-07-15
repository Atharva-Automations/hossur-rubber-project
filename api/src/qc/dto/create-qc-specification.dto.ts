import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateQcSpecificationDto {
  @IsInt()
  recipeId!: number;

  @IsOptional()
  @IsNumber()
  hardness?: number;

  @IsOptional()
  @IsNumber()
  tensile?: number;

  @IsOptional()
  @IsNumber()
  elongation?: number;

  @IsOptional()
  @IsNumber()
  specificGravity?: number;

  @IsOptional()
  @IsNumber()
  compressionSet?: number;
}
