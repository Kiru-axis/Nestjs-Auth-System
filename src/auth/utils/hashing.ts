import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export async function bCryptHash(plainText: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainText, salt);
  return hash;
}

export async function bCryptDecode(plainText: string, cipherText: any) {
  const decoded = await bcrypt.compare(plainText, cipherText);

  return decoded;
}
