import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import {Provider, useSelector} from 'react-redux';
import * as serviceWorker from './serviceWorker';
import * as Tone from 'tone'
import music from "./bensound-happyrock.mp3"
import {build,shiftActivePosition, setIsPlay,} from "./features/counter/counterSlice";
// ///////////////////////////////////
// Explain a method of play music
// when onloaded cut whole audio buffer to "4n" length of buffers
// when push a button, tiny length of buffer is played
// after buffer has played, soft synth is also play by scheduleRepeat callback
// ///////////////////////////////////

//Tone.js------------------------------
let musicLength=0
let slicedBuffers=[]
let slicedBuffers4=[]
let slicedBuffers8=[]

export let setSlicedBuffers=(
  buf,
  expandBefore = store.getState().counter.expandBefore,
  expandAfter = store.getState().counter.expandAfter,
  wait = store.getState().counter.wait,
  bpm = store.getState().counter.bpm,
  )=>{
  let length = buf.duration
  let step = 60/bpm

  let buffers=[]
  let buffers4=[]
  let buffers8=[]

  let sp=0+wait
  let ep=step+wait

  let bufIdx=0

  while(ep<musicLength+step){
    let spEx = sp-expandBefore
    let epEx = ep+expandAfter
    let ep4Ex= ep+3*step+expandAfter
    let ep8Ex= ep+7*step+expandAfter
    spEx = (spEx<0) ? 0 : (spEx>length) ? length :spEx
    epEx = (epEx<0) ? 0 : (epEx>length) ? length :epEx
    ep4Ex = (ep4Ex<0) ? 0 : (ep4Ex>length) ? length :ep4Ex
    ep8Ex = (ep8Ex<0) ? 0 : (ep8Ex>length) ? length :ep8Ex
    if(spEx>=epEx) spEx =sp

    buffers[bufIdx]=      buf.slice(spEx,epEx)
    if(bufIdx%8==0) buffers8[bufIdx] = buf.slice(spEx,ep8Ex)
    if(bufIdx%4==0) buffers4[bufIdx] = buf.slice(spEx,ep4Ex)
    sp+=step
    ep+=step
    bufIdx+=1
  }

  slicedBuffers=buffers
  slicedBuffers8=buffers8
  slicedBuffers4=buffers4
}

export let originalBuffer

let musicOnLoad=()=>{
  musicLength = newPlayer.buffer.duration
  setSlicedBuffers(newPlayer.buffer)
  originalBuffer = newPlayer.buffer.slice(0,musicLength)
  store.dispatch(build(musicLength))
}

//主音源再生用のオブジェクト
export const newPlayer = new Tone.Player(music,()=>musicOnLoad()).toDestination();
newPlayer.loop = false;
newPlayer.autostart = false;
newPlayer.volume.value=-18

export let synthScore=[]

//get score from state
let score,isLoop,isPlaySynth,expandBefore,expandAfter,wait,bpm,activePosition

let reloadState=()=>{
  //Call back of state change
  let counter = store.getState().counter
  isLoop = counter.isLoop
  isPlaySynth = counter.isPlaySynth
  expandBefore = counter.expandBefore
  expandAfter = counter.expandAfter
  wait = counter.wait
  bpm = counter.bpm
  activePosition = counter.activePosition
  let rawScore = counter.quarterNotes
  score = rawScore.map(x=>toNoteString(x))
}
store.subscribe(reloadState)

newPlayer.loop=false

//let loop = new Tone.Loop(()=>{},60/90)
let subCallBack=()=>{;}

let loop = new Tone.Loop((time)=>{
  newPlayer.start(time)
  subCallBack(time)
}, "2").start()


export const playMusic = (startStep, endStep, isLoop=true, toEnd=false)=>{
  //This block is a key of sound delay. You should reduce the delay. Below is one of the solutions.
  if(endStep==startStep) return "Abnormal called"

  let nowStep = startStep
  //0.005 object 0.05 now =>0.005 without constructor
  loop.cancel()
  newPlayer.buffer = slicedBuffers[nowStep]
  loop.interval=newPlayer.buffer.duration
  loop.start()

  subCallBack=(time)=>{
    let synthNoteDuration =0.3
    if (isPlaySynth) synth.triggerAttackRelease(score[nowStep], synthNoteDuration, time);
    store.dispatch(shiftActivePosition(nowStep))
    //次のステップをセット
    nowStep = (nowStep+1<endStep) ?nowStep+1 : startStep;
    newPlayer.buffer = slicedBuffers[nowStep]
  }
  Tone.Transport.start()
}

export const resumeTest=()=>{
  if(newPlayer.state=="stopped"){
    Tone.Transport.start()
    newPlayer.start() //is this needed?
  }else {
    Tone.Transport.stop()
    newPlayer.stop() //is this needed?
  }
}

export const synth = new Tone.Synth().toDestination();
synth.volume.value=0

export const toNoteString=(num)=>{
  // 24 = C2
  // noteNumber = noteSymbol + noteHeight
  const toToneLetter=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B',]
  let noteNumber=num
  let noteSymbol = toToneLetter[noteNumber%12]
  let noteHeight = ~~(noteNumber/12)
  let note = String(noteSymbol)+String(noteHeight)
  return note
}

export const timeColoned =(sec)=>{
  // 105 -> 1:45
  let date = new Date(null);
  date.setSeconds(sec); // specify value for SECONDS here
  if(Number.isNaN(date.getTime())){
    //to avoid a case date = Invalid Date
    return 0
  }
  return date.toISOString().substr(14, 5);
}

//------------
require('react-dom');
window.React2 = require('react');

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
