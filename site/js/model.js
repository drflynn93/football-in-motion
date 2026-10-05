export const TEAMS = ['BUF', 'KC'];
export const emptyTotals = () => ({ score: 0, rushing: 0, passing: 0, netPassing: 0, returns: 0, interceptions: 0, recoveries: 0, yards: 0 });

export function createModel(game) {
  validateGame(game);
  const totals = Object.fromEntries(TEAMS.map(t => [t, emptyTotals()]));
  const snapshots = [];
  for (const event of game.events) {
    const before = structuredClone(totals);
    for (const team of TEAMS) {
      for (const key of ['rushing', 'passing', 'netPassing', 'returns', 'interceptions', 'recoveries']) totals[team][key] += event.deltas[team][key];
      totals[team].score = event.scoreAfter[team];
      totals[team].yards = totals[team].rushing + totals[team].netPassing + totals[team].returns;
    }
    snapshots.push({ event, before, after: structuredClone(totals) });
  }
  const quarters = [1, 2, 3, 4, 5].map(q => {
    const snapshot = snapshots.findLast(s => s.event.quarter <= q);
    return { quarter: q, elapsed: q < 5 ? q * 900 : game.events.at(-1).elapsed, totals: snapshot?.after ?? Object.fromEntries(TEAMS.map(t => [t, emptyTotals()])) };
  });
  return { game, snapshots, totals: structuredClone(totals), quarters, fourthDowns: Object.fromEntries(TEAMS.map(t => [t, fourthDownSummary(game.events, t)])) };
}

export function fourthDownSummary(events, team) {
  const decisions = events.filter(e => e.team === team && e.fourthDown);
  const attempts = decisions.filter(e => e.fourthDown.decision === 'go');
  const conversions = attempts.filter(e => e.fourthDown.converted).length;
  return { decisions, count: decisions.length, attempts: attempts.length, conversions, goRate: decisions.length ? attempts.length / decisions.length : null, successRate: attempts.length ? conversions / attempts.length : null };
}

export function validateGame(game) {
  if (game?.schemaVersion !== 1 || game.id !== '2021_20_BUF_KC' || !Array.isArray(game.events) || game.events.length < 1) throw new Error('The saved game is incomplete.');
  const seen = new Set();
  let priorElapsed = -1;
  let previousScore = { BUF: 0, KC: 0 };
  for (const event of game.events) {
    if (seen.has(event.id) || !Number.isFinite(event.elapsed) || event.elapsed < priorElapsed || !Number.isInteger(event.quarter) || event.quarter < 1 || event.quarter > 5) throw new Error('The play order could not be verified.');
    seen.add(event.id); priorElapsed = event.elapsed;
    if (typeof event.description !== 'string' || !event.description.trim()) throw new Error('A play description is missing.');
    for (const team of TEAMS) {
      if (event.scoreBefore?.[team] !== previousScore[team] || !Number.isInteger(event.scoreAfter?.[team]) || event.scoreAfter[team] < previousScore[team]) throw new Error('The scoring sequence could not be verified.');
      previousScore[team] = event.scoreAfter[team];
      for (const key of ['rushing', 'passing', 'netPassing', 'returns', 'interceptions', 'recoveries']) {
        if (!Number.isFinite(event.deltas?.[team]?.[key])) throw new Error('A required yardage value is missing.');
      }
    }
    if (!Array.isArray(event.segments) || event.segments.some(s => !TEAMS.includes(s.team) || !Number.isFinite(s.yards))) throw new Error('A play movement is invalid.');
    for (const team of TEAMS) {
      const expected = event.deltas[team].rushing + event.deltas[team].netPassing + event.deltas[team].returns;
      if (event.segments.filter(s => s.team === team).reduce((a, s) => a + s.yards, 0) !== expected) throw new Error('The displayed path does not match the yardage.');
    }
  }
  if (previousScore.BUF !== 36 || previousScore.KC !== 42) throw new Error('The final score could not be verified.');
}

export function buildSchedule(events, duration = 416000) {
  const weights = events.map((e, i) => 1.5 + Math.min(45, Math.max(0, (events[i + 1]?.elapsed ?? e.elapsed) - e.elapsed)) * 0.035);
  const total = weights.reduce((a, b) => a + b, 0);
  let time = 0;
  return events.map((event, i) => {
    const start = time;
    time += duration * weights[i] / total;
    return { id: event.id, start, end: i === events.length - 1 ? duration : time };
  });
}

export function positionAt(schedule, time) {
  if (time <= 0) return { index: 0, fraction: 0 };
  const index = schedule.findIndex(s => time < s.end);
  if (index < 0) return { index: schedule.length - 1, fraction: 1 };
  const item = schedule[index];
  return { index, fraction: Math.max(0, Math.min(1, (time - item.start) / (item.end - item.start))) };
}

// Keep score labels as real whole-number scores, even while paths are moving.
export function scoreDisplayAt(model, schedule, index, fraction, time) {
  return Object.fromEntries(TEAMS.map(team => {
    const current = model.snapshots[index];
    const scoring = current.before[team].score !== current.after[team].score;
    const applied = scoring && fraction >= 0.7;
    const score = applied ? current.after[team].score : current.before[team].score;
    let recent = applied ? index : index - 1;
    while (recent >= 0 && model.snapshots[recent].before[team].score === model.snapshots[recent].after[team].score) recent--;
    const item = schedule[recent];
    const scoredAt = item ? 4000 + item.start + (item.end - item.start) * 0.7 : -Infinity;
    return [team, { score, highlight: time >= scoredAt && time - scoredAt < 3000 }];
  }));
}
