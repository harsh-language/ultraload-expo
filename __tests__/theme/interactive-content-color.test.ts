import { interactiveContentColor } from '../../src/theme/interactiveContentColor';
import { colors } from '../../src/theme/tokens';

describe('interactiveContentColor', () => {
  it('dims content-1 to content-2 when pressed', () => {
    expect(interactiveContentColor(false, 'dim')).toBe(colors['content-1']);
    expect(interactiveContentColor(true, 'dim')).toBe(colors['content-2']);
  });

  it('brightens content-2 to content-1 when pressed', () => {
    expect(interactiveContentColor(false, 'brighten')).toBe(
      colors['content-2'],
    );
    expect(interactiveContentColor(true, 'brighten')).toBe(
      colors['content-1'],
    );
  });
});
