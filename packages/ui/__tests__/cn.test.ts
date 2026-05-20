import { cn } from '../src/utils/cn';

describe('cn', () => {
  it('combines conditional classes and resolves Tailwind conflicts', () => {
    expect(cn('px-2', false && 'hidden', ['text-sm', 'px-4'], { block: true })).toBe(
      'text-sm px-4 block',
    );
  });
});
