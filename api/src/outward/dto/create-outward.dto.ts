import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOutwardDto {
  @IsString()
  materialName!: string;

  @IsNumber()
  quantity!: number;

  @IsString()
  unit!: string;

  @IsString()
  issuedTo!: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
