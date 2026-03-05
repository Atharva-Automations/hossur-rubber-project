import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsPositive,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateOutwardDto {
  @IsOptional() // Made optional since we'll use inwardId instead
  @IsString()
  materialName?: string;

  @IsInt()
  @IsPositive()
  inwardId!: number;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsString()
  @IsNotEmpty()
  issuedTo!: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedQrIds?: string[];
}
