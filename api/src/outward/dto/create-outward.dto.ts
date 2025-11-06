// src/outward/dto/create-outward.dto.ts
import { BaseDto } from '../../common/dto/base.dto';
import { IsString, IsOptional } from 'class-validator';

export class CreateOutwardDto extends BaseDto {
  @IsString()
  issuedTo!: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
