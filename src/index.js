import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import {Provider, useSelector} from 'react-redux';
import * as serviceWorker from './serviceWorker';

import * as Tone from 'tone'
import music from "./music2.mp3";
import {
  build,
  playActiveToneBySoft,
  secToActivePosition,
  setSeq,
  shiftActivePosition, setIsPlay, setClickedPosition
} from "./features/counter/counterSlice";

//Tone.js------------------------------
let musicLength=0
let tempo,note4n,note1m,note2m

let slicedBuffers=[]

export let setSlicedBuffers=(
buf,
expandBefore = store.getState().counter.expandBefore,
expandAfter = store.getState().counter.expandAfter,
wait = store.getState().counter.wait,
bpm = store.getState().counter.bpm,
  )=>{
  console.log('start',performance.now())
  let length = buf.duration

  let step = 60/bpm

  let buffers=[]

  let sp=0+wait
  let ep=step+wait

  let bufIdx=0

  while(ep<musicLength){
    let spEx = sp-expandBefore
    let epEx = ep+expandAfter
    spEx = (spEx<0) ? 0 : (spEx>length) ? length :spEx
    epEx = (epEx<0) ? 0 : (epEx>length) ? length :epEx

    buffers[bufIdx]=      buf.slice(spEx,epEx)
    sp+=step
    ep+=step
    bufIdx+=1
  }

  slicedBuffers=buffers
  console.log('end',performance.now())
}

let musicOnLoad=()=>{
  musicLength = newPlayer.buffer.duration
  tempo=130
  note4n = 60/tempo
  note1m = 4*60/tempo
  note2m = 2*4*60/tempo
  setSlicedBuffers(newPlayer.buffer)

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

export const newPlayer2 = new Tone.Player(music,()=>musicOnLoad()).connect(soloB).toDestination();
newPlayer2.loop = false;
newPlayer2.autostart = false;
newPlayer2.isPlay=false
newPlayer2.volume.value=-18

const soloC =new Tone.Solo().toDestination()

const soloD = new Tone.Solo().toDestination() //debug

//主音源再生用のオブジェクト
/*
export const player = new Tone.Player(music,()=>musicOnLoad()).toDestination();

player.loop = true;
player.autostart = false;
player.isPlay=false
player.volume.value=-18

 */

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

export const testRun = (startStep,endStep)=>{
  //startStep<0 then play from activePosition
  //endStep<0 then stop at musicLength
  //bpm = [beat/minutes] 1beat = 60/bpm sec
  if(endStep==startStep) return null
  soloC.solo=true

  //debug
  if((endStep-startStep)==1){
    newPlayer.buffer=slicedBuffers[startStep]
    newPlayer.start(0)
    return null
    //slicedBuffers[startStep].connect(soloD).toDestination()
  }

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
  let inactiveObject=newPlayer2
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
        if(flipBool){
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
}


export const resumeTest=()=>{
  console.log('seconds',Tone.Transport.seconds)
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
