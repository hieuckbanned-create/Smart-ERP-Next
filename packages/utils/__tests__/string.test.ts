import { slugify, truncate, initials, randomCode, maskPhone, maskEmail } from '../src/string';

describe('string utilities', () => {
  describe('slugify', () => {
    it('should convert standard Vietnamese accents to URL-safe ASCII slug', () => {
      expect(slugify('Học Lập Trình Web')).toBe('hoc-lap-trinh-web');
      expect(slugify('Đại học Bách Khoa Hà Nội')).toBe('dai-hoc-bach-khoa-ha-noi');
      expect(slugify('Trường Đại Học')).toBe('truong-dai-hoc');
    });

    it('should clean symbols, multiple spaces and punctuation', () => {
      expect(slugify('Hello World!!!')).toBe('hello-world');
      expect(slugify('  A  lot  of    spaces  ')).toBe('a-lot-of-spaces');
      expect(slugify('Admin & User - Management')).toBe('admin-user-management');
    });

    it('should handle all uppercase/lowercase mapping', () => {
      expect(slugify('ÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ')).toBe('aaaaaaaaaaaaaaaaa');
      expect(slugify('ÈÉẺẼẸÊẾỀỂỄỆ')).toBe('eeeeeeeeeee');
      expect(slugify('ÌÍỈĨỊ')).toBe('iiiii');
      expect(slugify('ÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ')).toBe('ooooooooooooooooo');
      expect(slugify('ÙÚỦŨỤƯỨỪỬỮỰ')).toBe('uuuuuuuuuuu');
      expect(slugify('ỲÝỶỸỴ')).toBe('yyyyy');
      expect(slugify('Đđ')).toBe('dd');
    });
  });

  describe('truncate', () => {
    it('should not truncate if text is shorter than or equal to maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should truncate and add ellipsis if text is longer than maxLength', () => {
      expect(truncate('Hello World', 8)).toBe('Hello W…');
      expect(truncate('Vietnam', 4)).toBe('Vie…');
    });
  });

  describe('initials', () => {
    it('should return empty string for empty input', () => {
      expect(initials('')).toBe('');
      expect(initials('   ')).toBe('');
    });

    it('should return uppercase initials for single and multi-word names (up to 2 characters)', () => {
      expect(initials('Nguyen Van A')).toBe('NV');
      expect(initials('john doe')).toBe('JD');
      expect(initials('Single')).toBe('S');
    });
  });

  describe('randomCode', () => {
    it('should generate a code of specified length', () => {
      const code8 = randomCode();
      expect(code8).toHaveLength(8);
      expect(/^[A-Z0-9]+$/.test(code8)).toBe(true);

      const code5 = randomCode(5);
      expect(code5).toHaveLength(5);
    });
  });

  describe('maskPhone', () => {
    it('should return original if phone length is less than 7', () => {
      expect(maskPhone('12345')).toBe('12345');
      expect(maskPhone('')).toBe('');
    });

    it('should mask middle characters correctly', () => {
      expect(maskPhone('0901234567')).toBe('0901***567');
      expect(maskPhone('1234567')).toBe('1234***567');
    });
  });

  describe('maskEmail', () => {
    it('should return original if it is not a valid email (no @)', () => {
      expect(maskEmail('invalidemail')).toBe('invalidemail');
    });

    it('should mask local part of the email correctly', () => {
      expect(maskEmail('user@example.com')).toBe('u***@example.com');
      expect(maskEmail('a@b.com')).toBe('a***@b.com');
    });
  });
});
