import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";
import {toNoteString} from '../../index'

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
  shiftQuarterNote,
  playToneBySoft,
  switchPlay,
  switchLoop,
  switchPlaySynth,
  fileInput,
  playBySeek,
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
  const quarterNotes = useSelector((state) => state.counter.quarterNotes)
  const isLoop = useSelector((state) => state.counter.isLoop)
  const isPlaySynth = useSelector((state) => state.counter.isPlaySynth)
  const dispatch = useDispatch();
  const audioLength = useSelector((state) => state.counter.musicLength)

  const [incrementAmount,setIncrementAmount,keyPosition,setKeyPosition] = useState(0);

  const incrementValue = Number(incrementAmount) || 0;
  let keyPositionValue = Number(keyPosition) || 0;



  let button4n=[]
  for(let i=0;i<numberOf4n;i++){
    //Block Loop

    if (i%(rowLength)==0){
     button4n.push(
       <div className={styles.quarterNoteBox}>
         <button
           className={styles.buttonMiniLoop}
           onClick={()=>dispatch(
             playThis({a:i,b:i+rowLength})
               )
           }
         >↺<br />8</button>
       </div>
     )
    }
    //Block loop
    if(i%(rowLength)==0 || i%(rowLength/2)==0){
      button4n.push(
        <div className={styles.quarterNoteBox}>
          <button
            className={styles.buttonMiniLoop}
            onClick={()=>dispatch(playThis({a:i,b:i+rowLength/2}))}
          >↺<br />4</button>
        </div>
      )
    }

    //Quarter Note
    let buttonClass = (activePosition==i) ? styles.buttonActive: styles.buttonMonospace
    button4n.push(
      <div className={styles.quarterNoteBox}>
        <button
          className={buttonClass}
          onClick={()=>dispatch(playThis({a:i,b:i+1}))}
        >{i+1}</button>
        <div id="eachNode" className={styles.noteSelctors}>
          <button
            className={styles.noteSelectorButton}
            onClick={()=>dispatch(shiftQuarterNote({position:i,shift:-1}))}
          > {"∧"} </button>
          <button
            className={styles.noteSelectorButton}
            onClick={()=>dispatch(playToneBySoft(quarterNotes[i]))}
            > {toNoteString(quarterNotes[i])} </button>
          <button
            className={styles.noteSelectorButton}
            onClick={()=>dispatch(shiftQuarterNote({position:i,shift:1}))}
          > {"∨"} </button>
        </div>
      </div>
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

  for(let i=0;i<rowButton4n.length;i++){
    let secOfBar = Math.floor(audioLength*(i*rowLength)/numberOf4n)
    console.log(secOfBar)
    let date = new Date(null);
    date.setSeconds(secOfBar); // specify value for SECONDS here
    let timeString = date.toISOString().substr(14, 5);

    allRowButton4n.push(

      <div className={styles.divRow}>
        <div>{timeString}-</div>
        <div>{rowButton4n[i]}</div>
      </div>
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
      //dispatch(playThis({a:activePosition,b:activePosition+1}))
      dispatch(switchPlay())
      event.preventDefault()
    }else if (event.code=='ArrowRight') {
      dispatch(playThis({a:activePosition+1,b:activePosition+2}))
      dispatch(shiftActivePosition(activePosition + 1))
      event.preventDefault()
    }else if (event.code=='ArrowLeft') {
      dispatch(playThis({a:activePosition-1,b:activePosition}))
      dispatch(shiftActivePosition(activePosition - 1))
      event.preventDefault()
    }else if (event.code=='ArrowUp') {
      dispatch(shiftQuarterNote({position:activePosition,shift:1}))
      //dispatch(shiftActivePosition(activePosition - 1))
      event.preventDefault()
    }else if (event.code=='ArrowDown') {
      dispatch(shiftQuarterNote({position:activePosition,shift:-1}))
      //dispatch(shiftActivePosition(activePosition - 1))
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

  //FIFO
  const uploadFile = React.createRef();
  //const file = uploadFile.current.files[0];



  return (
    <div>
      <div id="tonePart">
        <div id="fifo">
          <input
            type="file"
            ref={uploadFile}
            onChange={()=>dispatch(fileInput(uploadFile))}
          />
          <input
            id="typeinp"
            type="range"
            className={styles.seekbar}
            min="0"
            max="100"
            defaultValue={0}
            //onChange={(e)=>console.debug(e)}
            onChange={(e)=>dispatch(playBySeek({a:Math.floor(numberOf4n*Number(e.target.value)/100),b:numberOf4n}))}
            step="1"
            />
        </div>
        <div id="configure" className={styles.configures}>
          <div id="tempo">
            Tempo
            <input
            className={styles.configInput}
            aria-label="Set increment amount"
            defaultValue={bpm}
            type="number"
            //value={bpm}
            onChange={(e) => dispatch(changeBpm(e.target.value))}
          />bpm
          </div>
          <div id="wait">
            Cue point <input
            className={styles.configInput}
            aria-label="Set increment amount"
            defaultValue={wait}
            type="number"
            step='0.1'
            onChange={(e) => dispatch(changeWait(e.target.value))}
          />seconds
          </div>
          <div id="expand">
            Plays <input
            className={styles.configInput}
            aria-label="Set increment amount"
            defaultValue={expand}
            type="number"
            step="0.1"
            onChange={(e) => dispatch(changeExpand(e.target.value))}
          /> seconds longer
          </div>
          <div>
            <input
              id={'loop'}
              type="checkbox"
              name="inputNames"
              checked={isLoop}
              onChange={()=>dispatch(switchLoop())}
              value={0}
            />loop
          </div>
          <div>
            <input
              id={'loop'}
              type="checkbox"
              name="inputNames"
              checked={isPlaySynth}
              onChange={()=>dispatch(switchPlaySynth())}
              value={0}
            />Play soft synth
          </div>

        </div>
        {allRowButton4n}
      </div>
    </div>
  );
}

/*
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
 */