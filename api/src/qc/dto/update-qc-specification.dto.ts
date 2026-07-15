import { PartialType } from '@nestjs/mapped-types';
import { CreateQcSpecificationDto } from './create-qc-specification.dto';

export class UpdateQcSpecificationDto extends PartialType(
  CreateQcSpecificationDto
) {}
