import { Injectable } from '@nestjs/common';
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class TotpService {
  private readonly step = 30;

  generateSecret(): string {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes = randomBytes(20);
    let secret = '';
    for (let i = 0; i < bytes.length; i++) {
      secret += base32Chars[bytes[i] % 32];
    }
    return secret;
  }

  generateTOTP(secret: string, counter?: number): string {
    const timeStep = counter ?? Math.floor(Date.now() / 1000 / this.step);
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(timeStep));
    const key = Buffer.from(secret, 'base64');
    const hmac = createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    return String(code % 1000000).padStart(6, '0');
  }

  verifyTOTP(secret: string, code: string, window = 1): boolean {
    const now = Math.floor(Date.now() / 1000 / this.step);
    for (let i = -window; i <= window; i++) {
      if (this.generateTOTP(secret, now + i) === code) return true;
    }
    return false;
  }

  getProvisioningUri(secret: string, email: string): string {
    const issuer = 'SmartERP';
    return `otpauth://totp/${issuer}:${encodeURIComponent(email)}?secret=${secret}&issuer=${issuer}`;
  }
}
