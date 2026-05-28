export class TimerManager {
  private timers: Record<
    string,
    {
      turnTimer: NodeJS.Timeout | null;
      countDownTimer: NodeJS.Timeout | null;
    }
  > = {};

  getTimers(roomId: string) {
    if (!this.timers[roomId]) {
      this.timers[roomId] = {
        turnTimer: null,
        countDownTimer: null,
      };
    }

    return this.timers[roomId];
  }

  stopTimers(roomId: string) {
    const t = this.timers[roomId];

    if (!t) return;

    if (t.turnTimer) clearTimeout(t.turnTimer);

    if (t.countDownTimer) clearInterval(t.countDownTimer);
  }
}