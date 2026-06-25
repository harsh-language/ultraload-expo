import { getButtonContentLayout } from '../../src/components/buttonContentLayout';

describe('getButtonContentLayout', () => {
  it('centres icon and label when only a leading icon is present', () => {
    expect(getButtonContentLayout(true, false)).toBe('centered');
  });

  it('aligns label left and icon right when only a trailing icon is present', () => {
    expect(getButtonContentLayout(false, true)).toBe('trailingEdge');
  });

  it('clusters leading icon and label left with trailing icon right when both are present', () => {
    expect(getButtonContentLayout(true, true)).toBe('splitEdges');
  });

  it('centres the label when no icons are present', () => {
    expect(getButtonContentLayout(false, false)).toBe('centered');
  });
});
