export function decodePLCAscii(registers: number[]): string {
  let qr = '';

  for (const value of registers) {
    const low = value & 0xff;
    const high = (value >> 8) & 0xff;

    if (low !== 0) {
      qr += String.fromCharCode(low);
    }

    if (high !== 0) {
      qr += String.fromCharCode(high);
    }
  }

  return qr.trim();
}
