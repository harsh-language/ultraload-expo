import { useTimerStore } from '../../src/stores/timerSlice';

describe('timer store', () => {
  beforeEach(() => {
    useTimerStore.setState({
      remainingSeconds: null,
      totalSeconds: null,
      isRunning: false,
    });
  });

  it('keeps remaining time when paused and resumes it', () => {
    const store = useTimerStore.getState();
    store.start(90);

    useTimerStore.getState().pause();
    expect(useTimerStore.getState()).toMatchObject({
      remainingSeconds: 90,
      totalSeconds: 90,
      isRunning: false,
    });

    useTimerStore.getState().resume();
    expect(useTimerStore.getState()).toMatchObject({
      remainingSeconds: 90,
      totalSeconds: 90,
      isRunning: true,
    });
  });

  it('clears the timer when the countdown finishes', () => {
    useTimerStore.getState().start(1);
    useTimerStore.getState().tick();

    expect(useTimerStore.getState()).toMatchObject({
      remainingSeconds: null,
      totalSeconds: null,
      isRunning: false,
    });
  });
});
