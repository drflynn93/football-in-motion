import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { normalizeRows } from './prepare-game.mjs';
import { createModel } from '../site/js/model.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const names={ARI:'Cardinals',ATL:'Falcons',BAL:'Ravens',BUF:'Bills',CAR:'Panthers',CHI:'Bears',CIN:'Bengals',CLE:'Browns',DAL:'Cowboys',DEN:'Broncos',DET:'Lions',GB:'Packers',HOU:'Texans',IND:'Colts',JAX:'Jaguars',KC:'Chiefs',LA:'Rams',LAR:'Rams',LAC:'Chargers',LV:'Raiders',MIA:'Dolphins',MIN:'Vikings',NE:'Patriots',NO:'Saints',NYG:'Giants',NYJ:'Jets',PHI:'Eagles',PIT:'Steelers',SEA:'Seahawks',SF:'49ers',TB:'Buccaneers',TEN:'Titans',WAS:'Commanders'};
const fields=new Set(['game_id','play_id','home_team','away_team','season_type','week','game_date','qtr','quarter_seconds_remaining','total_away_score','total_home_score','away_score','home_score','posteam','defteam','play_type','no_play','two_point_attempt','rush_attempt','pass_attempt','sack','yards_gained','passing_yards','complete_pass','return_team','return_yards','interception','fumble','fumble_recovery_1_team','fumble_recovery_2_team','fumble_recovery_1_yards','fumble_recovery_2_yards','touchdown','first_down_rush','first_down_pass','first_down_penalty','field_goal_attempt','field_goal_result','safety','down','fourth_down_converted','passer_player_name','rusher_player_name','receiver_player_name','punt_returner_player_name','kickoff_returner_player_name','interception_player_name','sack_player_name','fumble_recovery_1_player_name','time','ydstogo','goal_to_go','yrdln','desc','quarter_end']);
// Handles quoted commas/newlines and doubled quotes without third-party dependencies.
export function* csvRows(text) {
 let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++) {
  const ch=text[i];
  if(ch==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
  else if(!quoted&&(ch===','||ch==='\n')){row.push(value.replace(/\r$/,''));value='';if(ch==='\n'){yield row;row=[];}}
  else value+=ch;
 }
 if(quoted)throw new Error('Unclosed CSV quote.');
 if(value||row.length){row.push(value.replace(/\r$/,''));yield row;}
}
export function prepareSelectedGame(rows,season) {
 const first=rows[0],teams=[first.away_team,first.home_team],id=first.game_id;
 if(teams.some(t=>!names[t]))throw new Error('Unknown team identity.');
 const finalScores=Object.fromEntries(teams.map((t,i)=>[t,Number(first[i===0?'away_score':'home_score'])]));
 if(['away_score','home_score'].some(key=>first[key]===undefined||String(first[key]).trim()==='')||teams.some(t=>!Number.isInteger(finalScores[t])||finalScores[t]<0))throw new Error('Missing final score.');
 const winner=finalScores[teams[0]]===finalScores[teams[1]]?null:finalScores[teams[0]]>finalScores[teams[1]]?teams[0]:teams[1];
 const last=rows.at(-1);
 if(last.desc!=='END GAME'&&!rows.some(r=>r.desc==='END GAME'))throw new Error('Source does not contain a completed game.');
 const game={schemaVersion:1,id,season,seasonType:first.season_type,week:Number(first.week),date:first.game_date,title:`${names[teams[0]]} vs ${names[teams[1]]}`,winner,teams:Object.fromEntries(teams.map(t=>[t,{name:season===2021&&t==='WAS'?'Washington':names[t],fullName:season===2021&&t==='WAS'?'Washington':names[t]}])),
  provenance:{source:`https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_${season}.csv.gz`,attribution:'nflverse play-by-play data',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modifications:'Filtered to one game; normalized scores, yardage and decisions.',verification:'Source structure, score sequence and final scoreboard checked; not independently reconciled to an official gamebook.'},
  opening:'Follow the opening kickoff and each play in source order.',events:normalizeRows(rows,{id,teams,season,seasonType:first.season_type}),expected:Object.fromEntries(teams.map(t=>[t,{score:finalScores[t]}]))};
 createModel(game);
 return game;
}
export async function prepareCatalog(seasons=[2021,2025]) {
 const catalog={schemaVersion:1,seasons,source:'nflverse',license:'CC BY 4.0',games:[],unavailable:[]};
 await mkdir(resolve(root,'site/data/games'),{recursive:true});
 for(const season of seasons){
  const compressed=await readFile(resolve(root,`.cache/play_by_play_${season}.csv.gz`));
  const records=csvRows(gunzipSync(compressed).toString('utf8')),headers=records.next().value;
  const indices=headers.map((key,i)=>fields.has(key)?[key,i]:null).filter(Boolean),groups=new Map();
  for(const record of records){if(record.length!==headers.length)throw new Error(`Invalid CSV field count in ${season}.`);const row=Object.fromEntries(indices.map(([key,i])=>[key,record[i]]));if(!row.game_id)continue; if(!groups.has(row.game_id))groups.set(row.game_id,[]);groups.get(row.game_id).push(row);}
  for(const [id,rows] of groups){
   const first=rows[0],entry={id,season,week:Number(first.week),seasonType:first.season_type,date:first.game_date,away:first.away_team,home:first.home_team,awayName:season===2021&&first.away_team==='WAS'?'Washington':names[first.away_team],homeName:season===2021&&first.home_team==='WAS'?'Washington':names[first.home_team],path:`data/games/${id}.json`};
   try {
    const game=id==='2021_20_BUF_KC'?JSON.parse(await readFile(resolve(root,'site/data/bills-chiefs.json'),'utf8')):prepareSelectedGame(rows,season);
    createModel(game);entry.awayScore=game.expected[entry.away].score;entry.homeScore=game.expected[entry.home].score;entry.verification=id==='2021_20_BUF_KC'?'official-example':'source-checked';
    await writeFile(resolve(root,`site/${entry.path}`),JSON.stringify(game)+'\n');catalog.games.push(entry);
   } catch(error){catalog.unavailable.push({...entry,reason:error.message});}
  }
  console.log(`${season}: ${catalog.games.filter(g=>g.season===season).length} usable games, ${catalog.unavailable.filter(g=>g.season===season).length} explicitly unavailable.`);
 }
 catalog.games.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 await writeFile(resolve(root,'site/data/catalog.json'),JSON.stringify(catalog,null,2)+'\n');
 console.log(JSON.stringify(catalog.unavailable.map(g=>({id:g.id,reason:g.reason}))));return catalog;
}
if(process.argv[1]===fileURLToPath(import.meta.url))await prepareCatalog();
