import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  playFull,
  build,
  changeBpm, changeWait, changeExpand,
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
  select4n,
  playThis, counterSlice,
} from './counterSlice';
import styles from './Counter.module.css';
import * as Tone from 'tone'
import music from "./music2.mp3";

//export let player

export function Counter() {

  const rowLength=8
  const loaded =useSelector((state) => state.counter.loaded)
  const count = useSelector(selectCount);
  const bpm=useSelector((state) => state.counter.bpm)
  const wait = useSelector((state) => state.counter.wait)
  const expand = useSelector((state) => state.counter.expand)
  const numberOf4n = useSelector(select4n);
  const dispatch = useDispatch();
  const [incrementAmount,setIncrementAmount] = useState();

  const incrementValue = Number(incrementAmount) || 0;

  //Tone.js------------------------------
  let musicLength=0
  let tempo,note4n,note1m,note2m

  if(loaded==0){
    let musicOnLoad=()=>{
      console.log(player.loaded)
      console.log('loaded')

      musicLength = player.buffer.duration
      tempo=bpm
      note4n = 60/tempo
      note1m = 4*60/tempo
      note2m = 2*4*60/tempo
      let numberOf4n=Math.ceil(musicLength*tempo/60)
      console.log(numberOf4n)
      dispatch(build(numberOf4n))
    }
    const player = new Tone.Player(music,()=>musicOnLoad()).toDestination();
    player.loop = true;
    player.autostart = false;
  }

  //------------

  let button4n=[]
  for(let i=0;i<numberOf4n;i++){
    button4n.push(
      <button
        className={styles.buttonMonospace}
        onClick={()=>dispatch(playThis({i}))}
      >{i+1}</button>
    )
  }

  let rowButton4n=[]
  for(let i=0;i<button4n.length;i++){
    let n=~~(i/rowLength)
    if(i%rowLength==0) rowButton4n[n]=[]
    rowButton4n[n].push(
      button4n[i]
    )
  }

  let allRowButton4n=[]
  for(let each of rowButton4n){
    allRowButton4n.push(
      <div>{each}</div>
    )
  }

  return (
    <div>
      <div id="tonePart">
        <button
          className={styles.button}
          onClick={()=>dispatch(build())}
        >Build</button>
        <div id="configure">
          <div id="tempo">
            Tempo
            <input
            className={styles.textbox}
            aria-label="Set increment amount"
            defaultValue={bpm}
            type="number"
            //value={bpm}
            onChange={(e) => dispatch(changeBpm(e.target.value))}
          />bpm
          </div>
          <div id="wait">
            Wait <input
            className={styles.textbox}
            aria-label="Set increment amount"
            defaultValue={wait}
            type="number"
            onChange={(e) => dispatch(changeWait(e.target.value))}
          />second
          </div>
          <div id="expand">
            Plays Longer <input
            className={styles.textbox}
            aria-label="Set increment amount"
            defaultValue={expand*100}
            type="number"
            onChange={(e) => dispatch(changeExpand(e.target.value))}
          /> %
          </div>

          <button
            className={styles.button}
          >Wait

          </button>
        </div>
        {allRowButton4n}
      </div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add Amount
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(incrementAsync(incrementValue))}
        >
          Add Async
        </button>
        <button
          className={styles.button}
          onClick={() => dispatch(incrementIfOdd(incrementValue))}
        >
          Add If Odd
        </button>
      </div>
    </div>
  );
}
