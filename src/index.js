import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import {Provider, useSelector} from 'react-redux';
import * as serviceWorker from './serviceWorker';

import * as Tone from 'tone'
//import music from "./music2.mp3";
import music from "./bensound-happyrock.mp3"
import {
  build,
  shiftActivePosition, setIsPlay,
} from "./features/counter/counterSlice";

//Tone.js------------------------------
let musicLength=0
let tempo,note4n,note1m,note2m

let slicedBuffers=[]
let slicedBuffers4=[]
let slicedBuffers8=[]

//However,all physicians should be equipped with an understanding of
// how to discuss migration history,
//record this information if it is safe to do so,
//and recognize what effect it should have on the medical care offered.

//Todo 4loop,8loop用のBufferArrayも作成すること
export let setSlicedBuffers=(
  buf,
  expandBefore = store.getState().counter.expandBefore,
  expandAfter = store.getState().counter.expandAfter,
  wait = store.getState().counter.wait,
  bpm = store.getState().counter.bpm,
  )=>{
  console.log('start',performance.now())
  let length = buf.duration
  console.log('buf',length)

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

  console.log('end',performance.now())
}

export let originalBuffer
let musicOnLoad=()=>{
  musicLength = newPlayer.buffer.duration
  tempo=130
  note4n = 60/tempo
  note1m = 4*60/tempo
  note2m = 2*4*60/tempo

  setSlicedBuffers(newPlayer.buffer)

  originalBuffer = newPlayer.buffer.slice(0,musicLength)

  store.dispatch(build(musicLength))
}
//refactoring

const soloA = new Tone.Solo();

export const newPlayer = new Tone.Player(music,()=>musicOnLoad()).connect(soloA).toDestination();
newPlayer.loop = false;
newPlayer.autostart = false;
newPlayer.isPlay=false
newPlayer.volume.value=-18

const soloB = new Tone.Solo();


//主音源再生用のオブジェクト

let seq =new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, 0.1, time);
  // subdivisions are given as subarrays
}, [0]);

export let synthScore=[]
let tickReso = 32

//get score from state
let score
let isLoop
let isPlaySynth
let expandBefore
let expandAfter
let wait
let bpm
let activePosition

let reloadState=()=>{
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


export const testRun = (startStep,endStep,isLoop=true,toEnd=false)=>{
  //startStep<0 then play from activePosition
  let bpm = Tone.Transport.bpm.value
  if(endStep==startStep) return null

  //play sliced buffer
  let argBuffer
  let playable=false
  if(toEnd==false) {
    //section Play
    //select sectioned buffer
    if ((endStep - startStep) == 1) {
      argBuffer = slicedBuffers
    } else if ((endStep - startStep) == 4) {
      argBuffer = slicedBuffers4
    } else if ((endStep - startStep) == 8) {
      argBuffer = slicedBuffers8
    }
    //set buffer to master
    if(argBuffer.length > startStep){
      playable=true
      newPlayer.buffer = argBuffer[startStep]
    }
  }else {
    //not sectioned play
    playable=true
    let startSec = startStep *60/bpm
    startSec = (startSec<0) ? 0 : (startSec>originalBuffer.duration)? originalBuffer.duration : startSec
    newPlayer.buffer = originalBuffer.slice(startSec,originalBuffer.duration)
  }

  //player Play
  if (playable) {
    newPlayer.start(0)
    newPlayer.loop = isLoop
  } else {
    newPlayer.stop(0)
  }
  console.log(seq)

  //Not section play such as start from here to end
  //play soft synth and progress seek bar
  let nowStep = startStep
  Tone.Transport.cancel()
  Tone.Transport.start()
  Tone.Transport.scheduleRepeat((time) => {
    //更新処理プログレスバーの更新処理
    if (isPlaySynth) synth.triggerAttackRelease(score[nowStep], 0.3, time);
    store.dispatch(shiftActivePosition(nowStep))
    //次のステップをセット
    nowStep = (nowStep+1<endStep) ?nowStep+1 : startStep;
    if(!isLoop) Tone.Transport.cancel(0)
  }, "4n", 0)
  Tone.Transport.bpm.value=bpm

  return null


  /*
  //definitions
  let tickParStep = tickReso / 4 //[tick/step]
  let secToTick=(sec)=> (sec/(60/bpm))*tickParStep

  //Initialize
  newPlayer.stop()
  Tone.Transport.cancel()

  let musicLength = newPlayer.buffer.duration
  let maxStep = ~~(musicLength / (60/bpm))
  let maxTick = maxStep * tickParStep
  let tick =0

  startStep = (startStep<0) ? activePosition : startStep
  let startSec = startStep *60/bpm + wait - expandBefore
  startSec = (startSec<0) ? 0 : (startSec>musicLength)? musicLength : startSec
  endStep = (endStep<0) ? maxStep: endStep
  let extraAfterTick = Math.floor(secToTick(expandAfter))
  let extraBeforeTick = Math.floor(secToTick(expandBefore))
  let endTick = (endStep-startStep)*tickParStep+extraAfterTick +extraBeforeTick

  let absInitTick = secToTick(startSec)
  let isDispatched = true
  let activeObject=newPlayer
  let inactiveObject=newPlayer//2
  let activeSolo =soloA
  let inactiveSolo = soloB
  let flipBool = false
  let isLoopDispatched=false

  //CallBack
  Tone.Transport.scheduleRepeat((time) => {

    let step= Math.floor(tick/tickParStep)+startStep

    //music Part
    if (newPlayer.state == "stopped888888" && (isDispatched && isLoop) ) {
      //停止中
      newPlayer.start(time,startSec,musicLength)
      isDispatched=false
      store.dispatch(setIsPlay(true))
    } else {
      //再生中
      if(isDispatched || isLoopDispatched) {
        if(isDispatched) {
          flipBool = !flipBool
        }
        if(flipBool || true){
          newPlayer.start(0, startSec, musicLength)
          soloB.solo=false
          soloA.solo=true
        }else{

          newPlayer2.start(0, startSec, musicLength)
          soloA.solo=false
          soloB.solo=true

        }

      }
      isDispatched=false
      isLoopDispatched=false

      //store.dispatch(setIsPlay(false))

    }
    //Synth part
    if (tick%tickParStep==0) {
      store.dispatch(shiftActivePosition(step))
      if (isPlaySynth) {
        //Play soft Synth
        synth.triggerAttackRelease(score[step], 0.3, time);
      }
    }

    //時間を進める処理
    tick+=1
    //プログレスバーを進める処理


    //戻す

    if(tick>=endTick){
      console.log(tick,endTick)
      console.log('end')

      newPlayer.stop()
      newPlayer2.stop()

      tick=0
      step=startStep
      if(!isLoop) Tone.Transport.stop()
      //debug//isDispatched=true
      isLoopDispatched=true

    }




  }, tickReso+"n", 0)
  Tone.Transport.bpm.value=bpm
  Tone.Transport.start()

   */
}


export const resumeTest=()=>{
  if(newPlayer.state=="stopped"){
    Tone.Transport.start()
    newPlayer.start()
  }else {
    Tone.Transport.stop()
    newPlayer.stop()
  }
}


export const setSoftSynthSequence=(notes)=>{
  let i =0
  let seqs = []
  for(let arg of notes){
    seqs.push(toNoteString(arg))
    seqs.push(0)
  }
  seq.events=seqs
}

//シークバーによる再生を、シークバーの進捗と四分音符ボタンの位置に同期させるFunction
export const playWithProgress = (isLoop,start,end)=>{
  /*
  if(!player.isPlay){

    let interval = 0.2
    let position =0
    Tone.Transport.scheduleRepeat((time) => {
      //再生状況をプログレスバーに反映するためのコールバック
      //ToDO:コールバックでstatusを確認して、stoppedならもっかい再生という
      //処理に変更すればシンプルかもしれない。

      if(!player.isPlay) {
        //再生開始時


        if(isLoop){
          //ループがTrue時は、stop/startが効かない。setLoopPointsで再生

          player.setLoopPoints(start, end)
          player.start()

        }else {
          player.stop()
          player.start(0, start, end)
        }
        player.isPlay = true
        player.sec = start

        //store.dispatch(setSeq())
        //seq.start()

      }else{
        //再生中
        player.sec += interval
        //曲の終わりまで来たら、手動で巻き戻し
        if(player.sec>=end) player.sec = start
        //ActivePositionを更新
        store.dispatch(secToActivePosition(player.sec))

      }
      if (player.state=='stopped'){
        //何らかの処理でplayerが止まったら、ちゃんと止める
        Tone.Transport.stop()
        store.dispatch(secToActivePosition(0))
        player.isPlay = false
      }


    }, interval, 0);

  }else{
    //すでに再生中に呼ばれたら、止める
    player.isPlay=false
    player.stop()
    Tone.Transport.stop()
  }

   */

}

//ソフトシンセ用のブロック
//export const loop = new Tone.Loop((time) => {
  //store.dispatch(playActiveToneBySoft())
//})//.start(0);
/*
Tone.Transport.scheduleRepeat((time) => {
   store.dispatch(playActiveToneBySoft(time))
}, "4n");
*/
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
console.log('reactcheck');
console.log(window.React1 === window.React2);

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
