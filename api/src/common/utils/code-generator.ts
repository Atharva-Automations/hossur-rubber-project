export function generateExecutionCode(sequence: number): string {
  return `EXE-${String(sequence).padStart(6, '0')}`;
}

export function generateBulkQrId(
  executionCode: string,
  batchNumber: number,
  plcIngredientIndex: number
): string {
  return `BW-${executionCode}-B${String(batchNumber).padStart(
    2,
    '0'
  )}-I${String(plcIngredientIndex).padStart(2, '0')}`;
}
