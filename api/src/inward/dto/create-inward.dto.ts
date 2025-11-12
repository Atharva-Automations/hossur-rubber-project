import { BaseDto } from '../../common/dto/base.dto';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateInwardDto extends BaseDto {
  @IsString()
  supplierName!: string;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;

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
