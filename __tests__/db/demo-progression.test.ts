import {
  DEMO_SESSIONS,
  LAST_FIXED_DEMO_SESSION,
  buildNextDemoSession,
  getStaleDemoWorkoutDates,
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
  it('covers fixed history from April through August 9', () => {
    expect(DEMO_SESSIONS.map((session) => session.date)).toEqual([
      '2026-04-01',
      '2026-04-08',
      '2026-04-15',
      '2026-04-22',
      '2026-05-01',
      '2026-05-08',
      '2026-05-15',
      '2026-05-22',
      '2026-06-01',
      '2026-06-08',
      '2026-06-15',
      '2026-06-22',
      '2026-07-01',
      '2026-07-03',
      '2026-07-05',
      '2026-07-07',
      '2026-07-09',
      '2026-07-11',
      '2026-07-13',
      '2026-07-15',
      '2026-07-17',
      '2026-07-20',
      '2026-07-22',
      '2026-07-24',
      '2026-07-26',
      '2026-07-28',
      '2026-07-31',
      '2026-08-02',
      '2026-08-05',
      '2026-08-09',
    ]);
    expect(LAST_FIXED_DEMO_SESSION.date).toBe('2026-08-09');
    expect(LAST_FIXED_DEMO_SESSION).toBe(
      DEMO_SESSIONS[DEMO_SESSIONS.length - 1],
    );
  });

  it('keeps working weight after one 10-rep set on August 9', () => {
    const next = buildNextDemoSession(LAST_FIXED_DEMO_SESSION);

    expect(setsFor(next, 'bench-press')).toEqual([
      { exerciseId: 'bench-press', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 110, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 110, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 105, reps: 8 },
    ]);

    expect(setsFor(next, 'low-bar-squats')).toEqual([
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 65, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 130, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 130, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 130, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 125, reps: 8 },
    ]);

    expect(setsFor(next, 'lat-pulldown')).toEqual([
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 95, reps: 8 },
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

describe('getStaleDemoWorkoutDates', () => {
  it('drops prior rolling-today days after reset, keeps fixed sessions + today', () => {
    expect(
      getStaleDemoWorkoutDates(
        ['2026-04-01', '2026-08-09', '2026-08-10', '2026-08-15'],
        '2026-08-15',
      ),
    ).toEqual(['2026-08-10']);
  });
});
