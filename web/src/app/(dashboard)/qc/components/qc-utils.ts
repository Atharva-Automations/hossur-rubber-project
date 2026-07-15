interface InspectionValues {
  hardness?: number;
  tensile?: number;
  elongation?: number;
  specificGravity?: number;
  compressionSet?: number;
}

interface SpecificationValues {
  hardness?: number;
  tensile?: number;
  elongation?: number;
  specificGravity?: number;
  compressionSet?: number;
}

export function getInspectionOutcome(
  specification: SpecificationValues,
  actual: InspectionValues
) {
  const checks = [
    ['hardness', actual.hardness, specification.hardness],
    ['tensile', actual.tensile, specification.tensile],
    ['elongation', actual.elongation, specification.elongation],
    ['specificGravity', actual.specificGravity, specification.specificGravity],
    ['compressionSet', actual.compressionSet, specification.compressionSet],
  ] as const;

  const passed = checks.every(([, actualValue, expectedValue]) => {
    if (actualValue === undefined || expectedValue === undefined) {
      return true;
    }
    return actualValue === expectedValue;
  });

  return {
    passed,
    status: passed ? 'PASS' : 'FAIL',
  };
}
