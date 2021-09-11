import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";
import {timeColoned, toNoteString} from '../../index'
import * as Tone from 'tone'
import 'bootstrap/dist/css/bootstrap.min.css';
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
  switchPlayBySeek, moveSeek,
} from './counterSlice';
import styles from './Counter.module.css';
import {Container,Row,Col} from "react-bootstrap";
let lastClick=0
let tempo = 100
function TapTempo(){


  let calcTempo=()=>{
    let lastTempo = tempo
    let thisClick = Tone.now()
    let interval = thisClick - lastClick
    console.log('int',interval,thisClick,lastClick)
    interval = (interval<12) ? interval : 12
    let newTempo = 60 / interval

    tempo = Math.round((lastTempo+newTempo)/2)
    lastClick = thisClick
    return tempo
  }

  const dispatch = useDispatch();

  return(
    <div>
      <button
        className={"btn btn-info m-1"}
        onClick={() =>{
            tempo = calcTempo()
            //console.log(tempo)
            dispatch(changeBpm(tempo))
          }
        }
      >Tap</button>

    </div>
  )
}

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
  const positionSec = useSelector((state) => state.counter.positionSec)

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
    let timeString = timeColoned(secOfBar)

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
    <Container>

        <Row id="seekbars text-left">
          <Col xs={12} className={"mb-2"}>Load your music file. Or you can test sample music file</Col>
          <Col xs={12} className={"mb-2"}>
            <input
              type="file"
              ref={uploadFile}
              onChange={()=>dispatch(fileInput(uploadFile))}
            />
          </Col>
          <Col xs={12} className={"mb-2"}>
            <input
              id="typeinp"
              type="range"
              className={styles.seekbar}
              min="0"
              max="100"
              defaultValue={activePosition}
              value={activePosition/numberOf4n*100}
              //onChange={(e)=>console.debug(e)}
              onChange={(e)=>dispatch(moveSeek(Math.floor(numberOf4n*Number(e.target.value)/100)))}
              step="1"
            />
          </Col>
          <Col xs={4}></Col>
          <Col xs={2} className={"mb-3"}>
            <button
              className={"btn btn-success"}
              onClick={()=>dispatch(switchPlayBySeek())}
            >Play/Stop</button>
          </Col>
          <Col xs={4}>
            <span style={{"font-size":1.5+'rem'}}>
              {timeColoned(audioLength*activePosition/numberOf4n)}
              {" / "}
              {timeColoned(audioLength)}
            </span>
          </Col>
          <Col xs={3} className={""}></Col>
          <Col xs={3} className={"form-check form-switch text-left"}>
            <input
              className={"form-check-input m-1"}
              id={'loop'}
              type="checkbox"
              name="inputNames"
              checked={isLoop}
              onChange={()=>dispatch(switchLoop())}
              value={0}
            />
            <label className={"form-check-label text-left"} for={"loop"}>
              loop
            </label>
          </Col>
          <Col xs={4} className={"form-check form-switch"}>
            <input
              className={"form-check-input m-1"}
              id={'synth'}
              type="checkbox"
              name="inputNames"
              checked={isPlaySynth}
              onChange={()=>dispatch(switchPlaySynth())}
              value={0}
            />
            <label className={"form-check-label"} for={"synth"}>
              Play soft synth
            </label>
          </Col>
        </Row>

        <Row className={""}>
          <Col xs={2}></Col>
          <Col className="input-group input-group-sm mb-1 col-xs-4 ">
            <span className="input-group-text" id="inputGroup-sizing-sm">BPM</span>
            <input
              type="number"
              className="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              defaultValue={bpm}
              type="number"
              value={bpm}
              onChange={(e) => dispatch(changeBpm(e.target.value))}
            />
            <TapTempo />
          </Col>
          <Col className="input-group input-group-sm mb-1 col-xs-3 ">
            <span className="input-group-text" id="inputGroup-sizing-sm">Cue point</span>
            <input
              type="number"
              className="form-control"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              defaultValue={wait}
              type="number"
              step='0.1'
              onChange={(e) => dispatch(changeWait(e.target.value))}
            />
          </Col>
          <Col xs={2}></Col>
        </Row>

        <Row>
          {allRowButton4n}
        </Row>

    </Container>
  );
}
