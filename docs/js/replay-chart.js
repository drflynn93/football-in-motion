const d3 = globalThis.d3;
export function createReplayChart(svgElement, model) {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();
  const [left,right]=model.teams;
  const teams=model.teams;
  const badgeWidth=Math.max(82,...teams.map(t=>model.game.teams[t].name.length*8+30));
  const scoreLimit=Math.max(14,Math.ceil(Math.max(...teams.map(t=>model.totals[t].score))/7)*7+7);
  const width = svgElement.clientWidth < 600 ? 640 : 980;
  svg.attr('viewBox', `0 0 ${width} 610`);
  const x = d3.scaleLinear().domain([-scoreLimit, scoreLimit]).range([badgeWidth/2+20, width-badgeWidth/2-20]);
  const yardValues = model.snapshots.flatMap(s => teams.map(t=>s.after[t].yards));
  const y = d3.scaleLinear().domain([Math.min(0, ...yardValues) - 15, Math.max(100,Math.ceil(Math.max(...yardValues) / 100) * 100)]).range([535, 65]);
  const xGroup = svg.append('g').attr('class','axis').attr('transform',`translate(0,${y(0)})`).call(d3.axisBottom(x).tickValues(d3.range(-scoreLimit,scoreLimit+1,7)).tickFormat(Math.abs));
  xGroup.append('text').attr('class','axis-title').attr('x',width/2).attr('y',67).text(`Actual score · ${model.game.teams[left].name} ← 0 → ${model.game.teams[right].name}`);
  const yGroup = svg.append('g').attr('class','axis').attr('transform',`translate(${x(0)},0)`).call(d3.axisLeft(y).ticks(6));
  svg.append('title').text('Cumulative yards gained versus actual score');
  const yardHeading = svg.append('g').attr('text-anchor','middle');
  yardHeading.append('text').attr('class','yardage-heading').attr('x',x(0)).attr('y',23).text('Cumulative yards gained');
  yardHeading.append('text').attr('class','yardage-subtitle').attr('x',x(0)).attr('y',43).text('Net offense + returns · yards');
  const paths = svg.append('g').attr('fill','none');
  const returnLabels = svg.append('g').attr('font-size',10).attr('fill','#176844');
  const labels = Object.fromEntries(teams.map(team => [team, svg.append('text').attr('class','team-name').attr('text-anchor',team===left?'end':'start').text(model.game.teams[team].name)]));
  const scoreMarkers = Object.fromEntries(teams.map(team => {
    const group=svg.append('g').attr('class','current-score').attr('data-team',team);
    group.append('line').attr('class','score-guide').attr('y1',y(0)).attr('y2',y(0)+18);
    group.append('rect').attr('width',badgeWidth).attr('height',26).attr('rx',4).attr('y',y(0)+20);
    group.append('text').attr('text-anchor','middle').attr('y',y(0)+38);
    return [team,group];
  }));
  const coordinate = (team, totals) => [x((team===left?-1:1)*totals.score), y(totals.yards)];
  const items = [];
  for (const [index,s] of model.snapshots.entries()) {
    for (const team of teams) {
      let yards = s.before[team].yards;
      const startScore = s.before[team].score;
      const steps = s.event.segments.filter(a=>a.team===team);
      for (const segment of steps) {
        const a = coordinate(team,{score:startScore,yards}); yards += segment.yards;
        const b = coordinate(team,{score:startScore,yards});
        if (segment.yards) items.push({index,team,a,b,category:segment.category,loss:segment.yards<0});
      }
      if (startScore!==s.after[team].score) items.push({index,team,a:coordinate(team,{score:startScore,yards}),b:coordinate(team,s.after[team]),category:'score',loss:false});
    }
  }
  const drawn = paths.selectAll('path').data(items).join('path').attr('stroke',d=>d.loss?'#b43f3f':'#176844').attr('stroke-width',2.6).attr('stroke-dasharray',d=>d.category==='pass'&&!d.loss?'2 5':null);
  const returns = returnLabels.selectAll('text').data(items.filter(d=>['PR','KR','IR','FR'].includes(d.category))).join('text').attr('x',d=>d.b[0]+(d.team===left?-8:8)).attr('y',d=>(d.a[1]+d.b[1])/2).attr('text-anchor',d=>d.team===left?'end':'start').text(d=>d.category);
  const render = function(index, fraction, reveal, scoreDisplay) {
    xGroup.attr('opacity',reveal>=1?1:0).attr('aria-hidden',reveal<1); yGroup.attr('opacity',reveal>=2?1:0).attr('aria-hidden',reveal<2);
    yardHeading.attr('opacity',reveal>=2?1:0).attr('aria-hidden',reveal<2);
    drawn.attr('d',d=>{
      if(d.index>index||reveal<3)return null;
      const f=d.index<index?1:fraction;
      // Yardage is drawn before the score change within a scoring play.
      const scoring = model.snapshots[d.index].event.scoreAfter[d.team]!==model.snapshots[d.index].event.scoreBefore[d.team];
      const progress=scoring?(d.category==='score'?Math.max(0,(f-.7)/.3):Math.min(1,f/.7)):f;
      return `M${d.a}L${d.a[0]+(d.b[0]-d.a[0])*progress},${d.a[1]+(d.b[1]-d.a[1])*progress}`;
    });
    returns.attr('opacity',d=>reveal>=3&&(d.index<index||d.index===index&&fraction===1)?1:0).attr('aria-hidden',d=>!(reveal>=3&&(d.index<index||d.index===index&&fraction===1)));
    for(const team of teams) {
      const s=model.snapshots[index]; const scoring=s.after[team].score!==s.before[team].score;
      const yardFraction=scoring?Math.min(1,fraction/.7):fraction;
      const scoreFraction=scoring?Math.max(0,(fraction-.7)/.3):fraction;
      const totals={score:s.before[team].score+(s.after[team].score-s.before[team].score)*scoreFraction,yards:s.before[team].yards+(s.after[team].yards-s.before[team].yards)*yardFraction};
      const p=coordinate(team,totals);
      labels[team].attr('x',p[0]+(team===left?-10:10)).attr('y',p[1]-8).attr('opacity',reveal>=3?1:0).attr('aria-hidden',reveal<3);
      const shown=scoreDisplay[team];
      const axisX=x((team===left?-1:1)*shown.score);
      const badgeX=axisX+(shown.score===0?(team===left?-(badgeWidth/2+2):badgeWidth/2+2):0);
      const marker=scoreMarkers[team].attr('opacity',reveal>=3?1:0).attr('aria-hidden',reveal<3).attr('aria-label',`${model.game.teams[team].name} current score ${shown.score}`);
      marker.select('line').attr('x1',axisX).attr('x2',badgeX);
      marker.select('rect').attr('x',badgeX-badgeWidth/2).attr('fill',shown.highlight?'#ffe58a':'#fff').attr('data-highlighted',String(shown.highlight));
      marker.select('text').attr('x',badgeX).text(`${model.game.teams[team].name} ${shown.score}`);
    }
  };
  render.coordinate = coordinate;
  render.width = width;
  return render;
}
