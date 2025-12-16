import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsEnum,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum UnitType {
  KG = 'KG',
  L = 'L',
}

export class CreateInwardDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  materialName!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  supplierName!: string;

  @IsEnum(UnitType)
  unit!: UnitType;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  bagWeight?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  storedAsWhole?: boolean;

  @IsDateString()
  mfgDate!: string;

  @IsDateString()
  expDate!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
