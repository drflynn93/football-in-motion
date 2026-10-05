import test from 'node:test';
import assert from 'node:assert/strict';
import { Playback } from '../site/js/playback.js';
function setup(duration=420000) {
 let now=0; const updates=[]; const scheduled=[];
 const clock=new Playback(duration,t=>updates.push(t),{now:()=>now,requestFrame:cb=>(scheduled.push(cb),scheduled.length),cancelFrame:()=>{}});
 const tick=t=>{now=t;clock.tick(t);};
 const setNow=t=>{now=t;};clock.start();return {clock,tick,setNow,updates,scheduled};
}
test('normal playback advances monotonically and clamps to seven minutes',()=>{const{clock,tick}=setup();tick(1000);assert.equal(clock.time,1000);tick(430000);assert.equal(clock.time,420000);assert.equal(clock.running,false);});
test('speed changes retain elapsed progress at both old and new rates',()=>{const{clock,tick,setNow}=setup();tick(1000);setNow(1500);clock.setSpeed(4);assert.equal(clock.time,1500);tick(2000);assert.equal(clock.time,3500);});
test('manual pause and resume exclude stopped time',()=>{const{clock,tick,setNow}=setup();tick(1000);clock.togglePause();tick(6000);assert.equal(clock.time,1000);setNow(7000);clock.togglePause();tick(8000);assert.equal(clock.time,2000);});
test('hover holds then resumes from the same position',()=>{const{clock,tick}=setup();tick(1000);clock.inspect('hover',true);tick(6000);assert.equal(clock.time,1000);clock.inspect('hover',false);tick(7000);assert.equal(clock.time,2000);});
test('leaving a marker preserves a pre-existing manual pause',()=>{const{clock,tick}=setup();tick(1000);clock.togglePause();clock.inspect('hover',true);tick(5000);clock.inspect('hover',false);tick(6000);assert.equal(clock.time,1000);assert.equal(clock.manualPaused,true);});
test('overlapping hover, focus and pinned reasons release independently',()=>{const{clock,tick}=setup();clock.inspect('hover',true);clock.inspect('focus',true);clock.inspect('hover',false);tick(1000);assert.equal(clock.time,0);clock.inspect('pinned',true);clock.inspect('focus',false);tick(2000);assert.equal(clock.time,0);clock.inspect('pinned',false);tick(3000);assert.equal(clock.time,1000);});
test('hidden-tab time does not skip ahead on return',()=>{const{clock,tick}=setup();tick(1000);clock.setInactive(true);tick(60000);clock.setInactive(false);tick(61000);assert.equal(clock.time,2000);});
test('Replay clears pause reasons and progress and can start again',()=>{const{clock,tick,updates}=setup();tick(1000);clock.togglePause();clock.inspect('pinned',true);clock.reset();assert.equal(clock.time,0);assert.equal(clock.paused,false);assert.equal(updates.at(-1),0);clock.start();tick(2000);assert.equal(clock.time,1000);});
test('a stopped clock cannot advance through a stale callback',()=>{const{clock,tick}=setup();clock.stop();tick(1000);assert.equal(clock.time,0);});
