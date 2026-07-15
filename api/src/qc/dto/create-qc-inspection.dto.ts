export class CreateQcInspectionDto {
  finalBatchId!: number;

  hardnessActual?: number;
  tensileActual?: number;
  elongationActual?: number;
  specificGravityActual?: number;
  compressionSetActual?: number;

  remarks?: string;
}
