import { createElement } from 'react';
import {
  cloneIconWithColor,
  pressedIconColor,
} from '../../src/components/icons/pressedIconColor';
import { colors } from '../../src/theme/tokens';

describe('pressedIconColor', () => {
  it('returns content-1 when idle and content-2 when active', () => {
    expect(pressedIconColor(false)).toBe(colors['content-1']);
    expect(pressedIconColor(true)).toBe(colors['content-2']);
  });
});

describe('cloneIconWithColor', () => {
  it('injects color onto a valid element child', () => {
    const child = createElement('svg', { color: colors['content-1'] });
    const cloned = cloneIconWithColor(child, colors['content-2']) as {
      props: { color?: string };
    };

    expect(cloned.props.color).toBe(colors['content-2']);
  });

  it('returns non-element children unchanged', () => {
    expect(cloneIconWithColor('x', colors['content-2'])).toBe('x');
    expect(cloneIconWithColor(null, colors['content-2'])).toBe(null);
  });
});
