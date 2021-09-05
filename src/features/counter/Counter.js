import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";

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
  shiftActivePosition,
} from './counterSlice';
import styles from './Counter.module.css';
import {useKey} from 'react-use';


//export let player
export function Counter() {

  const rowLength=8
  const loaded =useSelector((state) => state.counter.loaded)
  const count = useSelector(selectCount);
  const bpm=useSelector((state) => state.counter.bpm)
  const wait = useSelector((state) => state.counter.wait)
  const expand = useSelector((state) => state.counter.expand)
  const numberOf4n = useSelector((state) => state.counter.numberOf4n)
  const activePosition = useSelector((state) => state.counter.activePosition)
  const dispatch = useDispatch();

  const [incrementAmount,setIncrementAmount,keyPosition,setKeyPosition] = useState(0);

  const incrementValue = Number(incrementAmount) || 0;
  let keyPositionValue = Number(keyPosition) || 0;



  let button4n=[]
  for(let i=0;i<numberOf4n;i++){
    if (i%(rowLength)==0){
     button4n.push(
       <button
         className={styles.buttonMiniLoop}
         onClick={()=>dispatch(
           playThis({a:i,b:i+rowLength})
             )
         }
       >↺8</button>
     )
    }
    if(i%(rowLength)==0 || i%(rowLength/2)==0){
      button4n.push(
        <button
          className={styles.buttonMiniLoop}
          onClick={()=>dispatch(playThis({a:i,b:i+rowLength/2}))}
        >↺4</button>
      )
    }
    let buttonClass = (activePosition==i) ? styles.buttonActive: styles.buttonMonospace
    button4n.push(
      <button
        className={buttonClass}
        onClick={()=>dispatch(playThis({a:i,b:i+1}))}
      >{i+1}</button>
    )
  }

  let rowButton4n=[]
  for(let i=0;i<button4n.length;i++){
    let actualRowLength = rowLength + 3
    let n=~~(i/actualRowLength)
    if(i%(actualRowLength)==0) rowButton4n[n]=[]
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

  //Key Listner
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  });

  const handleKeyDown = (event) => {
    console.debug("Key event", event);
    if (event.code=='Space') {
      dispatch(playThis({a:activePosition,b:activePosition+1}))
      event.preventDefault()
    }else if (event.code=='ArrowRight') {
      dispatch(playThis({a:activePosition+1,b:activePosition+2}))
      dispatch(shiftActivePosition(activePosition + 1))
      event.preventDefault()
    }else if (event.code=='ArrowLeft') {
      dispatch(playThis({a:activePosition-1,b:activePosition}))
      dispatch(shiftActivePosition(activePosition - 1))
      event.preventDefault()
    }
    //dispatch(handleKeyInput(game_state, connection_status, event.key));
    document.removeEventListener('keydown', handleKeyDown);

  };

  const handleKeyUp = (event) => {
    console.log(1)
    document.addEventListener('keydown', handleKeyDown, {once: true});
    event.preventDefault()
  };


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
            Cue point <input
            className={styles.textbox}
            aria-label="Set increment amount"
            defaultValue={wait}
            type="number"
            step='0.1'
            onChange={(e) => dispatch(changeWait(e.target.value))}
          />seconds
          </div>
          <div id="expand">
            Plays <input
            className={styles.textbox}
            aria-label="Set increment amount"
            defaultValue={expand}
            type="number"
            step="0.1"
            onChange={(e) => dispatch(changeExpand(e.target.value))}
          /> seconds longer
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
