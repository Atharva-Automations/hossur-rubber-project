import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum UnitType {
  KG = 'KG',
  L = 'L',
}

export class BaseDto {
  @IsString()
  materialName!: string;

  @IsEnum(UnitType)
  unit!: UnitType;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
