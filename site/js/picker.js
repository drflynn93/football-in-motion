export function filterGames(games,season,team='all') {
 return games.filter(g=>g.season===Number(season)&&(team==='all'||g.away===team||g.home===team));
}
export function gameLabel(game) {
 return `${game.date} · ${game.awayName} at ${game.homeName} · ${game.seasonType==='POST'?'Playoffs':`Week ${game.week}`}`;
}
export class GameLoader {
 constructor(fetcher=(...args)=>globalThis.fetch(...args)){this.fetcher=fetcher;this.generation=0;this.controller=null;}
 cancel(){this.generation++;this.controller?.abort();}
 async load(path){
  this.cancel();const generation=this.generation;this.controller=new AbortController();
  try{const response=await this.fetcher(path,{signal:this.controller.signal});if(!response.ok)throw new Error('The selected game could not be loaded.');const game=await response.json();return generation===this.generation?game:null;}
  catch(error){if(generation!==this.generation||error.name==='AbortError')return null;throw error;}
 }
}
