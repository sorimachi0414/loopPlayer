import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  playFull,
  play2nd,
  play3rd,
  build,
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
  select4n,
  playThis,
} from './counterSlice';
import styles from './Counter.module.css';
import * as Tone from 'tone'

export function Counter() {
  const rowLength=8
  const count = useSelector(selectCount);
  const numberOf4n = useSelector(select4n);
  const dispatch = useDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

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
            Tempo <input
            className={styles.textbox}
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />bpm
          </div>
          <div id="wait">
            Wait <input
            className={styles.textbox}
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />second
          </div>
          <div id="expand">
            Plays Longer <input
            className={styles.textbox}
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />times
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
