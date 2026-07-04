// src/recipe/dto/create-recipe.dto.ts
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum StepType {
  KNEADER = 'KNEADER',
  MIXING = 'MIXING',
}

export class StepIngredientDto {
  @IsString()
  @MinLength(1)
  ingredientCode!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @Min(0)
  tolerance!: number;

  @IsString()
  @MinLength(1)
  unit!: string;
}

export class RecipeStepDto {
  @IsEnum(StepType)
  stepType!: StepType;

  @IsInt()
  @Min(1)
  sequenceNumber!: number; // execution order within the step group

  // Process parameters (per your latest update)
  @IsInt()
  @Min(0)
  timerSeconds!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pressure?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rpm?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepIngredientDto)
  ingredients!: StepIngredientDto[];
}

export class CreateRecipeDto {
  @IsString()
  @MinLength(1)
  recipeCode!: string; // e.g. SR01

  @IsString()
  @MinLength(1)
  name!: string;

  @IsBoolean()
  active = true;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeStepDto)
  steps!: RecipeStepDto[];

  @IsString()
  description?: string;
}
