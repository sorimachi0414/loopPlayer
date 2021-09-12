import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCount } from './counterAPI';
import {player, synth, toNoteString, loop, now, playWithProgress} from '../../index'
import * as Tone from 'tone'

const initialState = {
  activePosition:0,
  isLoop:true,
  isPlay:false,
  isPlaySynth:true,
  loaded:0,
  value: 0,
  bpm:113,
  wait:0,
  expand:0,
  status: 'idle',
  musicLength:0,
  numberOf4n:3,
  quarterNotes:[],
  audioProgressSec:0,
};



// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
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
    switchPlayBySeek:(state,action)=>{
      player.user=Tone.now()
      if (player.state=='stopped'){
        let activePositionSec = state.musicLength*state.activePosition/state.numberOf4n
        playWithProgress(state.isLoop,activePositionSec,state.musicLength)
        Tone.Transport.stop()
        Tone.Transport.start();
        state.isPlay=true
      }else{
        player.stop()
        player.isPlay=false
        state.isPlay=false
        Tone.Transport.stop()
        Tone.Transport.cancel(0)
      }
    },
    switchPlay:(state)=>{
      if (player.state=='stopped'){
        player.start()
        player.isPlay=true
        state.isPlay=true
        Tone.Transport.start();
      }else{
        player.stop()
        player.isPlay=false
        state.isPlay=false
        Tone.Transport.stop()
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
    },
    moveSeek:(state,action)=>{
      state.activePosition = action.payload
      let sec = state.musicLength * action.payload / state.numberOf4n
      if(player.isPlay){
        console.log('moveseek')
        player.stop()
        player.isPlay=false
        state.isPlay=false
        Tone.Transport.stop()
        Tone.Transport.cancel(0)
        playWithProgress(state.isLoop,sec,state.musicLength)
        Tone.Transport.stop()
        Tone.Transport.start();
      }
    },

    playThis:(state,action)=>{
      let a = action.payload.a
      let b = action.payload.b
      let note4n=state.musicLength/state.numberOf4n
      let loopStart=state.wait+(note4n*a)-state.expand
      let loopEnd=state.wait+note4n*(b)+state.expand
      loopStart = (loopStart<0) ? 0 : (loopStart>state.musicLength)? state.musicLength : loopStart
      loopEnd = (loopEnd<loopStart) ? loopStart : (loopEnd>state.musicLength)? state.musicLength : loopEnd

      if (state.isLoop) {
        console.log('loop')
        player.setLoopPoints(loopStart,loopEnd );
        player.start()
        player.isPlay=true
        state.isPlay=true

        loop.interval=loopEnd-loopStart
        Tone.Transport.stop()
        Tone.Transport.cancel(0)
        Tone.Transport.start();
      }else{
        //console.debug(player)
        //player.seek("+"+state.musicLength,0)
        if (player.state=='started'){
          player.stop()
          player.start(0,loopStart,loopEnd-loopStart)
        }else{
          player.loop=false
          player.start(0,loopStart,loopEnd-loopStart+0.5)
        }
        //player.stop("+"+(loopEnd-loopStart))
        //player.stop("+"+(loopEnd-loopStart))
        Tone.Transport.stop("+"+(loopEnd-loopStart))
      }

      state.activePosition=a
    },

    changeBpm:(state,action)=>{
      state.bpm=Number(action.payload)
      state.numberOf4n = Math.ceil(state.musicLength * state.bpm /60)
      //Tone.Transport.bpm=action.payload
    },
    changeWait:(state,action)=>{
      state.wait=Number(action.payload)
    },
    changeExpand:(state,action)=>{
      state.expand=Number(action.payload)
    },
    secToActivePosition:(state,action)=>{
      let sec = action.payload
      state.activePosition = Math.floor(state.numberOf4n * sec / state.musicLength)
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
    playActiveToneBySoft:(state)=>{
      let note = toNoteString(state.quarterNotes[state.activePosition])
      if (state.isPlaySynth) synth.triggerAttackRelease(note, "8n");

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
      player.load(blob)
    }

  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value += action.payload;
      });
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
  changeExpand,
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
} = counterSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectCount = (state) => state.counter.value;
export const select4n = (state) => state.counter.numberOf4n;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const incrementIfOdd = (amount) => (dispatch, getState) => {
  console.log('uncre')
  const currentValue = selectCount(getState());
  if (currentValue % 2 === 1) {
    dispatch(incrementByAmount(amount));
  }
};

export default counterSlice.reducer;
