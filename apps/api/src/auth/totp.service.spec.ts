import { TotpService } from './totp.service';

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(() => {
    service = new TotpService();
  });

  describe('generateSecret', () => {
    it('returns a base32-encoded secret of at least 16 chars', () => {
      const secret = service.generateSecret();
      expect(secret.length).toBeGreaterThanOrEqual(16);
    });

    it('generates unique secrets on successive calls', () => {
      const secrets = new Set(Array.from({ length: 10 }, () => service.generateSecret()));
      expect(secrets.size).toBe(10);
    });
  });

  describe('generateTOTP', () => {
    it('returns a 6-digit code for a valid secret', () => {
      const code = service.generateTOTP('JBSWY3DPEHPK3PXP');
      expect(code).toMatch(/^\d{6}$/);
    });

    it('returns different codes at different time steps', () => {
      const code1 = service.generateTOTP('JBSWY3DPEHPK3PXP', 1000);
      const code2 = service.generateTOTP('JBSWY3DPEHPK3PXP', 1001);
      expect(code1).not.toBe(code2);
    });
  });

  describe('verifyTOTP', () => {
    it('accepts a valid code within the window', () => {
      const secret = service.generateSecret();
      const code = service.generateTOTP(secret);
      expect(service.verifyTOTP(secret, code)).toBe(true);
    });

    it('rejects an invalid code', () => {
      expect(service.verifyTOTP('JBSWY3DPEHPK3PXP', '000000')).toBe(false);
    });
  });

  describe('getProvisioningUri', () => {
    it('returns an otpauth URI with the correct format', () => {
      const uri = service.getProvisioningUri('JBSWY3DPEHPK3PXP', 'user@test.com');
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain('user%40test.com');
      expect(uri).toContain('SmartERP');
    });
  });
});
