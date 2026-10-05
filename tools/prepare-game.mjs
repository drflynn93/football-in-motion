import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createModel, emptyTotals, TEAMS } from '../site/js/model.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const number = (r, key, required = false) => {
  if ((r[key] === '' || r[key] == null) && required) throw new Error(`Required ${key} missing at ${r.play_id}`);
  const value = Number(r[key] || 0);
  if (!Number.isFinite(value)) throw new Error(`Invalid ${key} at ${r.play_id}`);
  return value;
};
const flag = (r, key) => number(r, key) === 1;
const delta = () => ({ rushing: 0, passing: 0, netPassing: 0, returns: 0, interceptions: 0, recoveries: 0 });

export function normalizeRows(rows) {
  let previousScore = { BUF: 0, KC: 0 };
  const events = [];
  for (const [sequence, r] of rows.entries()) {
    if (r.game_id !== '2021_20_BUF_KC') throw new Error('Unexpected game in source.');
    const quarter = number(r, 'qtr', true);
    const elapsed = (quarter - 1) * 900 + 900 - number(r, 'quarter_seconds_remaining', true);
    const scoreAfter = { BUF: number(r, 'total_away_score', true), KC: number(r, 'total_home_score', true) };
    const deltas = { BUF: delta(), KC: delta() };
    const segments = [];
    const team = TEAMS.includes(r.posteam) ? r.posteam : null;
    const valid = r.play_type !== 'no_play' && !flag(r, 'no_play');
    const regular = valid && !flag(r, 'two_point_attempt');
    let category = r.play_type || 'context';
    if (flag(r, 'sack')) category = 'sack';
    if (regular && team && (flag(r, 'rush_attempt') || r.play_type === 'qb_kneel')) {
      deltas[team].rushing = number(r, 'yards_gained', true);
      segments.push({ team, category: 'run', yards: deltas[team].rushing });
    } else if (regular && team && (flag(r, 'pass_attempt') || flag(r, 'sack') || r.play_type === 'qb_spike')) {
      deltas[team].netPassing = number(r, 'yards_gained', true);
      deltas[team].passing = number(r, 'passing_yards', flag(r, 'complete_pass'));
      segments.push({ team, category: flag(r, 'sack') ? 'sack' : 'pass', yards: deltas[team].netPassing });
    }
    if (regular && TEAMS.includes(r.return_team) && number(r, 'return_yards')) {
      const returnCategory = r.play_type === 'punt' ? 'PR' : r.play_type === 'kickoff' ? 'KR' : flag(r, 'interception') ? 'IR' : 'FR';
      deltas[r.return_team].returns += number(r, 'return_yards');
      segments.push({ team: r.return_team, category: returnCategory, yards: number(r, 'return_yards') });
    }
    if (regular && flag(r, 'interception') && TEAMS.includes(r.defteam)) deltas[r.defteam].interceptions += 1;
    // Own recoveries are neither defensive recoveries nor additional return production.
    for (const suffix of ['1', '2']) {
      const recoveryTeam = r[`fumble_recovery_${suffix}_team`];
      if (regular && TEAMS.includes(recoveryTeam) && recoveryTeam !== team && flag(r, 'fumble')) {
        deltas[recoveryTeam].recoveries += 1;
        if (!number(r, 'return_yards')) {
          const yards = number(r, `fumble_recovery_${suffix}_yards`);
          deltas[recoveryTeam].returns += yards;
          if (yards) segments.push({ team: recoveryTeam, category: 'FR', yards });
        }
      }
    }
    const tags = [];
    if (valid && flag(r, 'touchdown')) tags.push('Touchdown!');
    if (valid && (flag(r, 'first_down_rush') || flag(r, 'first_down_pass') || flag(r, 'first_down_penalty'))) tags.push('First down!');
    if (valid && flag(r, 'sack')) tags.push('Sack');
    if (valid && flag(r, 'interception')) tags.push('Interception');
    if (valid && flag(r, 'fumble')) tags.push('Fumble');
    if (valid && flag(r, 'field_goal_attempt')) tags.push(r.field_goal_result === 'made' ? 'Field goal!' : 'Field goal missed');
    if (valid && flag(r, 'safety')) tags.push('Safety');
    let fourthDown = null;
    if (regular && number(r, 'down') === 4 && ['run','pass','punt','field_goal','qb_kneel','qb_spike'].includes(r.play_type)) {
      fourthDown = {
        decision: r.play_type === 'punt' ? 'punt' : r.play_type === 'field_goal' ? 'field_goal' : 'go',
        converted: flag(r, 'fourth_down_converted'),
        result: r.play_type === 'field_goal' ? r.field_goal_result : r.play_type === 'punt' ? 'punt' : flag(r, 'fourth_down_converted') ? 'converted' : 'failed'
      };
    }
    const players = [...new Set(['passer_player_name','rusher_player_name','receiver_player_name','punt_returner_player_name','kickoff_returner_player_name','interception_player_name','sack_player_name','fumble_recovery_1_player_name'].map(key => r[key]).filter(Boolean))];
    events.push({ id: String(r.play_id), sequence, quarter, clock: r.time, elapsed, team, returnTeam: r.return_team || null, down: r.down ? number(r,'down') : null, yardsNeeded: r.ydstogo ? number(r,'ydstogo') : 0, goalToGo: flag(r,'goal_to_go'), fieldPosition: r.yrdln || '', category, nullified: !valid, description: r.desc, players, tags, deltas, segments, scoreBefore: { ...previousScore }, scoreAfter, fourthDown, quarterEnd: flag(r,'quarter_end') || r.desc === 'END GAME' });
    previousScore = scoreAfter;
  }
  return events;
}

export async function prepareGame() {
  const raw = await readFile(resolve(root, 'devpost/research/bills-chiefs-source-rows.json'));
  const source = JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, ''));
  const game = {
    schemaVersion: 1, id: '2021_20_BUF_KC', date: '2022-01-23', title: 'Bills vs Chiefs', winner: 'KC',
    teams: { BUF: { name: 'Bills', fullName: 'Buffalo Bills' }, KC: { name: 'Chiefs', fullName: 'Kansas City Chiefs' } },
    provenance: { source: source.source, rawSha256: createHash('sha256').update(raw).digest('hex'), attribution: 'nflverse play-by-play data', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', modifications: 'Filtered to one game; normalized scoring, yardage, player context and decisions.', verificationSource: 'https://static.www.nfl.com/image/upload/v1677629313/gamecenter/34f0d976-71ad-11ec-a493-77fb1cc3a88e.pdf' },
    opening: 'Kansas City wins the coin toss and defers. Buffalo receives the opening kickoff.',
    events: normalizeRows(source.rows),
    expected: { BUF: { score: 36, rushing: 109, passing: 329, netPassing: 313, returns: 22, interceptions: 0, recoveries: 0, yards: 444, fourthCount: 8, fourthAttempts: 4, fourthConversions: 4 }, KC: { score: 42, rushing: 182, passing: 378, netPassing: 370, returns: 86, interceptions: 0, recoveries: 0, yards: 638, fourthCount: 5, fourthAttempts: 1, fourthConversions: 1 } }
  };
  const model = createModel(game);
  for (const team of TEAMS) {
    for (const key of Object.keys(emptyTotals())) if (model.totals[team][key] !== game.expected[team][key]) throw new Error(`Mismatch: ${team} ${key}`);
    for (const [actual,key] of [['count','fourthCount'],['attempts','fourthAttempts'],['conversions','fourthConversions']]) if (model.fourthDowns[team][actual] !== game.expected[team][key]) throw new Error(`Mismatch: ${team} ${key}`);
  }
  await mkdir(resolve(root,'site/data'),{ recursive: true });
  await writeFile(resolve(root,'site/data/bills-chiefs.json'), JSON.stringify(game,null,2)+'\n');
  console.log(`Prepared ${game.events.length} ordered events; official final totals and fourth downs reconcile.`);
  return game;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareGame();
