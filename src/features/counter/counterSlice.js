import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCount } from './counterAPI';
import {
  newPlayer,
  synth,
  toNoteString,
  playMusic,
  resumeTest, setSlicedBuffers, originalBuffer,
} from '../../index'
import * as Tone from 'tone'

const initialState = {
  activePosition:0,
  clickedPosition:0,
  isLoop:true,
  isPlaySynth:false,
  loaded:0,
  value: 0,
  bpm:90,
  wait:0,
  expandBefore:0,
  expandAfter:0,
  musicLength:0,
  numberOf4n:3,
  quarterNotes:[],
  speed:1.0,
  volume:50,
  lastStartPoint:0,
  lastEndPoint:0,
};

export const incrementAsync = createAsyncThunk(
  'counter/fetchCount',
  async (amount) => {
    const response = await fetchCount(amount);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setIsPlay:(state,action)=>{
      state.isPlay=action.payload
    },
    playThis:(state,action)=>{
        state.isPlay=true
        let startStep = action.payload.a
        let endStep = action.payload.b
        state.activePosition = startStep
        state.clickedPosition = startStep
        playMusic(startStep, endStep)
        state.lastStartPoint = startStep
        state.lastEndPoint = endStep
    },
    changeSpeed:(state,action)=>{
      let rate = action.payload
      state.speed = rate
      let shift=0
      if (rate<=0.5){
        rate=0.5
        shift=12
      }else if (rate<=0.75){
        rate=0.75
        shift=5
      }else if(rate<1.5){
        rate=1.0
        shift=0
      }else if(rate<=1.75){
        rate=1.5
        shift=-7
      }else{
        rate=2.0
        shift=-12
      }

      newPlayer.playbackRate = rate
      let shifter = new Tone.PitchShift({
        pitch:shift,
        windowSize:0.1,
      }).toDestination()
      newPlayer.disconnect()
      newPlayer.connect(shifter)

    },
    switchPlayBySeek:(state,action)=>{
      if (newPlayer.state=='stopped') {
        playMusic(0,state.numberOf4n)
        state.isPlay=true //slicerで変えないとエラーが出る時が。
      }else{
        resumeTest()
        state.isPlay=false
      }
    },
    moveSeek:(state,action)=>{
      state.activePosition = action.payload
      state.clickedPosition = action.payload
      playMusic(action.payload,state.numberOf4n)
      state.isPlay=true
    },
    switchPlay:(state)=>{
      if (newPlayer.state=='stopped'){
        //停止中
        playMusic(state.activePosition,state.numberOf4n)
        state.isPlay=true //slicerで変えないとエラーが出る時が。
      }else{
        //再生中
        resumeTest()
        state.isPlay=false
      }
    },
    build:(state,action)=>{
      let musicLength = action.payload
      state.musicLength = musicLength
      let numberOf4n = Math.ceil(musicLength * state.bpm /60)
      state.numberOf4n = numberOf4n
      state.loaded=1
      for(let i=0;i<numberOf4n;i++){
        state.quarterNotes.push(36)
      }
      Tone.Transport.bpm.value=state.bpm
    },
    changeBpm:(state,action)=>{
      let bpm = Number(action.payload)
      bpm = (bpm<1) ? 1 : bpm
      bpm = (bpm>999) ? 999 : bpm
      state.bpm=bpm
      setSlicedBuffers(
        originalBuffer,
        state.expandBefore,
        state.expandAfter,
        state.wait,
        bpm,
      )
      state.numberOf4n = Math.ceil(state.musicLength * state.bpm /60)
      Tone.Transport.bpm.value=bpm
    },
    changeWait:(state,action)=>{
      state.wait=Number(action.payload)
      setSlicedBuffers(
        originalBuffer,
        state.expandBefore,
        state.expandAfter,
        Number(action.payload),
        state.bpm,
      )
      playMusic(state.lastStartPoint,state.lastEndPoint)

      //reBuild
      let musicLength = state.musicLength-Number(action.payload)
      let numberOf4n = Math.ceil(musicLength * state.bpm /60)
      state.numberOf4n = numberOf4n
      state.loaded=1
      for(let i=0;i<numberOf4n;i++){
        state.quarterNotes.push(36)
      }
    },
    changeVolume:(state,action)=>{
      let vol = Number(action.payload)
      state.volume=vol
      let dB = -36 + 36*vol/100
      dB =(vol==0) ? -100:dB
      dB =(dB>0) ? 0 : dB
      newPlayer.volume.value=dB
    },
    changeExpandBefore:(state,action)=>{
      state.expandBefore=Number(action.payload)
      setSlicedBuffers(
        originalBuffer,
        Number(action.payload),
        state.expandAfter,
        state.wait,
        state.bpm,
      )
      playMusic(state.lastStartPoint,state.lastEndPoint)

    },
    changeExpandAfter:(state,action)=>{
      state.expandAfter=Number(action.payload)
      setSlicedBuffers(
        originalBuffer,
        state.expandBefore,
        Number(action.payload),
        state.wait,
        state.bpm,
      )
      playMusic(state.lastStartPoint,state.lastEndPoint)

    },
    secToActivePosition:(state,action)=>{
      let sec = action.payload
      state.activePosition = Math.floor(state.numberOf4n * sec / state.musicLength)
    },
    setClickedPosition:(state,action)=>{
      state.clickedPosition = action.payload
    },
    shiftActivePosition:(state,action)=>{
      state.activePosition=action.payload
      state.activePosition = (state.activePosition<0) ? 0: (state.activePosition>=state.numberOf4n) ? state.numberOf4n-1 : state.activePosition
    },
    shiftQuarterNote:(state,action)=>{
      let i = action.payload.position
      let shift = action.payload.shift
      state.quarterNotes[i] = state.quarterNotes[i]+shift
      let note = toNoteString(state.quarterNotes[i]+shift)
      synth.triggerAttackRelease(note, "8n");
    },
    playToneBySoft:(state,action)=>{
      let note = toNoteString(action.payload)
      if (state.isPlaySynth) synth.triggerAttackRelease(note, "8n");
      //sub function
    },
    playActiveToneBySoft:(state,action)=>{
      let note = toNoteString(state.quarterNotes[state.activePosition])
      //if (state.isPlaySynth) synth.triggerAttackRelease(note, "8n",action.payload);
    },
    switchLoop:(state)=>{
      state.isLoop = !state.isLoop
    },
    switchPlaySynth:(state)=>{
      state.isPlaySynth = !state.isPlaySynth
    },
    fileInput:(state,action)=>{
      console.debug(action.payload)
      let file = action.payload.current.files[0]
      console.log(file)
      let blob = URL.createObjectURL(file)
      newPlayer.load(blob)
    }

  },
});

export const {
  increment,
  decrement,
  incrementByAmount,
  initPlayer,
  playFull,
  build,
  playThis,
  changeBpm,
  changeWait,
  changeExpandBefore,
  changeExpandAfter,
  shiftActivePosition,
  shiftQuarterNote,
  playToneBySoft,
  switchPlay,
  playActiveToneBySoft,
  switchLoop,
  switchPlaySynth,
  fileInput,
  playBySeek,
  switchPlayBySeek,
  secToActivePosition,
  moveSeek,
  changeSpeed,setClickedPosition,
  changeVolume,setSeq,newTest,testSwitch,setIsPlay,clickedPosition,
} = counterSlice.actions;

export default counterSlice.reducer;
