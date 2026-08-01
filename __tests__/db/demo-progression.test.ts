import {
  DEMO_SESSIONS,
  LAST_FIXED_DEMO_SESSION,
  buildNextDemoSession,
  type DemoSession,
  type DemoSet,
} from '../../src/db/demoData';

function setsFor(
  sets: readonly DemoSet[],
  exerciseId: string,
): DemoSet[] {
  return sets.filter((set) => set.exerciseId === exerciseId);
}

describe('buildNextDemoSession', () => {
  it('exports the last fixed session as 2026-07-24', () => {
    expect(LAST_FIXED_DEMO_SESSION.date).toBe('2026-07-24');
    expect(LAST_FIXED_DEMO_SESSION).toBe(
      DEMO_SESSIONS[DEMO_SESSIONS.length - 1],
    );
  });

  it('increases working weight after two 10-rep sets (July 24 → next)', () => {
    const next = buildNextDemoSession(LAST_FIXED_DEMO_SESSION);

    expect(setsFor(next, 'bench-press')).toEqual([
      { exerciseId: 'bench-press', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
    ]);

    expect(setsFor(next, 'low-bar-squats')).toEqual([
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 60, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 8 },
    ]);

    expect(setsFor(next, 'lat-pulldown')).toEqual([
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
    ]);
  });

  it('applies increase vs keep per exercise from prior 10-rep count', () => {
    const prior: DemoSession = {
      date: '2026-07-22',
      sets: [
        { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
        { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 10 },
        { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 9 },
        { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
        { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
        { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
        { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
        { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
        { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 9 },
        { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
        { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
        { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
        { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 9 },
        { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
        { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
      ],
    };

    const next = buildNextDemoSession(prior);

    expect(setsFor(next, 'bench-press')).toEqual([
      { exerciseId: 'bench-press', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
    ]);

    expect(setsFor(next, 'low-bar-squats')).toEqual([
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 60, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
    ]);

    expect(setsFor(next, 'lat-pulldown')).toEqual([
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
    ]);
  });

  it('orders exercises bench → squat → lat', () => {
    const next = buildNextDemoSession(LAST_FIXED_DEMO_SESSION);
    expect(next.map((set) => set.exerciseId)).toEqual([
      ...Array(5).fill('bench-press'),
      ...Array(5).fill('low-bar-squats'),
      ...Array(5).fill('lat-pulldown'),
    ]);
  });
});
