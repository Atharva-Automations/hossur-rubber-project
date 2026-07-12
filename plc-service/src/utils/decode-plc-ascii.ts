export function decodePLCAscii(registers: number[]): string {
  const bytes: number[] = [];

  for (const value of registers) {
    bytes.push((value >> 8) & 0xff);
    bytes.push(value & 0xff);
  }

  return Buffer.from(bytes).toString('ascii').replace(/\0/g, '').trim();
}
