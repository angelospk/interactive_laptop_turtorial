// Where somebody was, and where they go next.
//
// The audience for this platform comes back after two weeks, not after two
// minutes. What they meet on the home page is 218 lessons in eleven modules,
// and the question they arrive with is not "what shall I learn today" — it is
// "what was I doing". Answering that in one card, with one button, is worth
// more than any lesson we could add.
//
// Kept as pure functions so the awkward parts — an empty history, a completed
// track, a lesson that was disabled since — can be argued with in a test
// instead of by clicking through a seeded database.

/** The little of a lesson this needs. Matches the columns the home page loads. */
export type ResumeLesson = {
  id: string;
  moduleId: string;
  lessonKey: string;
  titleKey: string;
  orderIndex: number;
};

/** The little of a progress row this needs. */
export type ResumeProgress = {
  completed?: boolean;
  completedAt?: Date | string | number | null;
  lastAttemptAt?: Date | string | number | null;
};

export type ResumePoint = {
  /** The lesson they last touched, if it still exists and is still enabled. */
  last: ResumeLesson | null;
  /** When they touched it. Null when there is no history at all. */
  lastAt: Date | null;
  /** Whole days since, for the sentence above the buttons. */
  daysAway: number | null;
  /** The first lesson they have not finished — where "Συνέχεια" goes. */
  next: ResumeLesson | null;
  /** True when every enabled lesson is done and there is nothing to continue to. */
  finished: boolean;
};

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Whole days between two instants, floored — 23 hours ago is still "today". */
export function wholeDaysBetween(then: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
}

/**
 * Work out where to put somebody back.
 *
 * `lessons` must already be the enabled ones: a lesson that was switched off
 * since they last saw it is not somewhere to send them back to, and it must not
 * become the thing the card is about.
 */
export function pickResumePoint(
  lessons: readonly ResumeLesson[],
  progress: Readonly<Record<string, ResumeProgress>>,
  now: Date = new Date()
): ResumePoint {
  const ordered = [...lessons].sort(
    (a, b) => a.moduleId.localeCompare(b.moduleId) || a.orderIndex - b.orderIndex
  );

  let last: ResumeLesson | null = null;
  let lastAt: Date | null = null;
  for (const lesson of ordered) {
    const row = progress[lesson.id];
    if (!row) continue;
    // The later of the two: finishing a lesson and re-opening it are both
    // "I was here", and only one of them is recorded in each column.
    const at = [toDate(row.completedAt), toDate(row.lastAttemptAt)]
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!at) continue;
    if (!lastAt || at.getTime() > lastAt.getTime()) {
      last = lesson;
      lastAt = at;
    }
  }

  const next = ordered.find((l) => !progress[l.id]?.completed) ?? null;

  return {
    last,
    lastAt,
    daysAway: lastAt ? wholeDaysBetween(lastAt, now) : null,
    next,
    finished: ordered.length > 0 && next === null
  };
}

/**
 * How long ago, in the words somebody would use.
 *
 * Deliberately vague past a week. "Πριν από 23 μέρες" is a number to feel bad
 * about; "πριν από τρεις εβδομάδες" is just where you were. Nothing here is
 * ever framed as overdue — this platform has no streaks to break, on purpose.
 */
export function describeGap(days: number | null): string | null {
  if (days === null) return null;
  if (days <= 0) return 'σήμερα';
  if (days === 1) return 'χθες';
  if (days < 7) return `πριν από ${days} μέρες`;
  if (days < 14) return 'πριν από μία εβδομάδα';
  if (days < 31) return `πριν από ${Math.round(days / 7)} εβδομάδες`;
  if (days < 60) return 'πριν από έναν μήνα';
  if (days < 365) return `πριν από ${Math.round(days / 30)} μήνες`;
  return 'πριν από πολύ καιρό';
}
