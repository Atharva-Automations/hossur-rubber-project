import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateOutwardDto {
  @IsString()
  @IsNotEmpty()
  materialName!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsOptional()
  unit?: string = 'KG';

  @IsString()
  @IsNotEmpty()
  issuedTo!: string;

  @IsString()
  @IsOptional()
  purpose?: string = 'Production';

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @IsNotEmpty()
  selectedQrIds!: string[];

  @IsString()
  @IsOptional()
  status?: string = 'Pending';
}
