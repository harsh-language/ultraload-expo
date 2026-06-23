import { resolveColorToken } from '../../src/theme/resolveColorToken';

describe('resolveColorToken', () => {
  it('splits 8-digit bg-trans-2 into white at 20%', () => {
    expect(resolveColorToken('bg-trans-2')).toEqual({
      token: 'bg-trans-2',
      color: '#FFFFFF',
      opacity: 0.2,
    });
  });

  it('splits 8-digit content-trans-light into fully transparent white', () => {
    expect(resolveColorToken('content-trans-light')).toEqual({
      token: 'content-trans-light',
      color: '#FFFFFF',
      opacity: 0,
    });
  });

  it('splits 8-digit bg-overlay into black at 60%', () => {
    expect(resolveColorToken('bg-overlay')).toEqual({
      token: 'bg-overlay',
      color: '#000000',
      opacity: 0.6,
    });
  });

  it('returns opacity 1 for 6-digit tokens', () => {
    expect(resolveColorToken('content-1')).toEqual({
      token: 'content-1',
      color: '#FFFFFF',
      opacity: 1,
    });
  });
});
