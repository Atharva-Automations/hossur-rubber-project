export class CreateQcSpecificationDto {
  recipeId!: number;

  hardness?: number;
  tensile?: number;
  elongation?: number;
  specificGravity?: number;
  compressionSet?: number;
}
