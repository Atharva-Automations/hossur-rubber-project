import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateInwardDto {
  @IsString()
  materialName!: string;

  @IsString()
  supplierName!: string;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;

  @IsString()
  unit!: string; // 👈 Added unit

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
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
