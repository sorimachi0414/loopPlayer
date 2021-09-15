import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";
import {timeColoned, toNoteString} from '../../index'
import * as Tone from 'tone'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  changeBpm, changeWait,
  selectCount,
  playThis, counterSlice,
  shiftActivePosition,
  shiftQuarterNote,
  playToneBySoft,
  switchPlay,
  switchLoop,
  switchPlaySynth,
  fileInput,
  playBySeek,
  switchPlayBySeek, moveSeek,changeExpandAfter,changeExpandBefore,changeSpeed,changeVolume
} from './counterSlice';
import styles from './Counter.module.css';
import {Container,Row,Col} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPause, faPauseCircle, faPlay, faPlayCircle, faStop,faCoffee} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-regular-svg-icons";
let lastClick=0
let tempo = 100

let fontObject =(min,nom,max)=> {
  let result
  result = {
    "font-size":"clamp("+
      min+"rem"
      +","+
      nom+"vw"
      +","+
      max+"rem"
      +")"
  }
  return result
}


const ChangeSpeed=()=>{
  const dispatch = useDispatch();
  const speed = useSelector((state) => state.counter.speed)

  return(
    <Row>
      <Col className={"px-0"}>
        <span
          className="input-group-text px-1" id="inputGroup-sizing-sm"
          style={fontObject(0.5,2,1)}        >

          Speed Rate
        </span>
      </Col>
      <Col>
        <input
          type="number"
          className="form-control p-1"
          aria-label="Sizing example input"
          aria-describedby="inputGroup-sizing-sm"
          defaultValue={speed}
          type="number"
          step='0.25'
          max={1}
          min={0.5}
          style={fontObject(0.5,2,1)}
          onChange={(e) => dispatch(changeSpeed(e.target.value))}
        />
      </Col>
    </Row>
  )

}

const InputCuePoint=()=>{
  const dispatch = useDispatch();
  const wait = useSelector((state) => state.counter.wait)

  return(
    <Row>
      <Col className={"px-0"}>
        <span
          style={fontObject(0.5,2,1)}
          className="input-group-text px-1" id="inputGroup-sizing-sm"
        >
          Cue point
        </span>
      </Col>
      <Col>
        <input
          type="number"
          className="form-control"
          aria-label="Sizing example input"
          aria-describedby="inputGroup-sizing-sm"
          defaultValue={wait}
          type="number"
          step='0.1'
          style={fontObject(0.5,2,1)}
          onChange={(e) => dispatch(changeWait(e.target.value))}
        />
      </Col>
    </Row>
  )
}
const Volume=()=>{
  const dispatch = useDispatch();
  const volume = useSelector((state) => state.counter.volume)


  return(
    <Row>
      <Col className={"px-0"}>
        <span
          style={fontObject(0.5,2,1)}
          className="input-group-text px-1" id="inputGroup-sizing-sm"
        >
          Volume
        </span>
      </Col>
      <Col>
        <input
          type="number"
          className="form-control"
          aria-label="Sizing example input"
          aria-describedby="inputGroup-sizing-sm"
          defaultValue={volume}
          type="number"
          max={100}
          min={0}
          step='10'
          style={fontObject(0.5,2,1)}
          onChange={(e) => dispatch(changeVolume(e.target.value))}
        />
      </Col>
    </Row>
  )
}
const InputBPM=()=>{
  const dispatch = useDispatch();
  const bpm=useSelector((state) => state.counter.bpm)

  return(
  <Row className={""}>
    <Col　className={"px-0"} xs={6}>
      <TapTempo />
    </Col>
    <Col className={""} xs={"6"}>
      <input
        type="number"
        className="form-control m-0 px-1"
        aria-label="Sizing example input"
        aria-describedby="inputGroup-sizing-sm"
        defaultValue={bpm}
        type="number"
        value={bpm}
        size={3}
        style={fontObject(0.5,2,1)}
        onChange={(e) => dispatch(changeBpm(e.target.value))}
    />
    </Col>

  </Row>
  )

}

const TapTempo=()=>{

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
      <button
        className={"btn btn-outline-secondary mx-0 px-1"}
        type="button"
        id="button-addon1"
        style={fontObject(0.5,2,1)}
        onClick={() =>{
            tempo = calcTempo()
            //console.log(tempo)
            dispatch(changeBpm(tempo))
          }
        }
      >BPM(Tap)</button>
  )
}

let ToggleLoop=()=>{
  const dispatch = useDispatch();
  const isLoop = useSelector((state) => state.counter.isLoop)

  return(
    <div>
      <input
        className={"form-check-input m-1"}
        id={'loop'}
        type="checkbox"
        name="inputNames"
        checked={isLoop}
        onChange={() => dispatch(switchLoop())}
        value={0}
      />
    <label
      className={"form-check-label text-left"}
      htmlFor={"loop"}
      style={fontObject(0.5,2,1)}
    >
      Loop
    </label>
    </div>
  )
}

const ToggleSynth=()=>{
  const dispatch = useDispatch();
  const isPlaySynth = useSelector((state) => state.counter.isPlaySynth)

  return(
    <div>
      <input
        className={"form-check-input m-1"}
        id={'synth'}
        type="checkbox"
        name="inputNames"
        checked={isPlaySynth}
        onChange={() => dispatch(switchPlaySynth())}
        value={0}
      />
      <label
        className={"form-check-label"}
        htmlFor={"synth"}
        style={fontObject(0.5,2,1)}
      >
        Soft piano
      </label>
    </div>
  )
}

//export let player
export function Counter() {

  const rowLength=8
  const loaded =useSelector((state) => state.counter.loaded)
  const count = useSelector(selectCount);
  const expand = useSelector((state) => state.counter.expand)
  const numberOf4n = useSelector((state) => state.counter.numberOf4n)
  const activePosition = useSelector((state) => state.counter.activePosition)
  const quarterNotes = useSelector((state) => state.counter.quarterNotes)
  const dispatch = useDispatch();
  const audioLength = useSelector((state) => state.counter.musicLength)
  const positionSec = useSelector((state) => state.counter.positionSec)
  const isPlay = useSelector((state) => state.counter.isPlay)

  const [incrementAmount,setIncrementAmount,keyPosition,setKeyPosition] = useState(0);

  const incrementValue = Number(incrementAmount) || 0;
  let keyPositionValue = Number(keyPosition) || 0;

  let button4n=[]
  for(let i=0;i<numberOf4n;i++){
    //Block Loop
    if (i%(rowLength)==0){
     button4n.push(
       <Col className={"p-1 offset-1 offset-sm-1"} xs={2} sm={1}>
         <Row>
           <Col>
             <button
               className={"btn btn btn-outline-dark w-75 my-1"}
               onClick={()=>dispatch(
                 playThis({a:i,b:i+rowLength})
                   )
               }
             >↺ 8</button>
           </Col>
           <Col>
             <button
               className={"btn btn btn-outline-dark w-75 my-1"}
               onClick={()=>dispatch(playThis({a:i,b:i+rowLength/2}))}
             >↺ 4</button>
           </Col>
         </Row>
       </Col>
     )
    }
    //Block loop
    if(i%(rowLength)!==0 && i%(rowLength/2)==0){
      button4n.push(
        <Col className={"p-1 offset-1 offset-sm-0"} xs={2} sm={1}>
          <button
            className={"btn btn-outline-dark w-75"}
            onClick={()=>dispatch(playThis({a:i,b:i+rowLength/2}))}
          >↺ 4</button>
        </Col>
      )
    }

    //Quarter Note
    let inactiveButtonClass ="btn btn btn-outline-success w-100 h-100 py-1"
    let activeButtonClass ="btn btn btn-success w-100 h-100 py-1"
    let buttonClass = (activePosition==i) ? activeButtonClass: inactiveButtonClass
    button4n.push(
      <Col className={"m-0 px-1 h-100"} id='buttonDiv' xs={2} sm={1}>
        <Row>
          <Col xs={12}>
            <button
              className={buttonClass+" px-0 px-sm-0"}
              onClick={()=>dispatch(playThis({a:i,b:i+1}))}
            ><span style={{"font-size":1.5+"em"}}>{i+1}</span></button>
          </Col>
          <Col id="eachNode" className={"my-1"} xs={12}>
            <button
              className={"btn btn-outline-secondary w-75 py-0 rounded-0"}
              onClick={()=>dispatch(shiftQuarterNote({position:i,shift:1}))}
            > {"∧"} </button>
            <button
              className={"btn btn-outline-secondary w-75 py-0 rounded-0 px-0"}
              onClick={()=>dispatch(playToneBySoft(quarterNotes[i]))}
              > {toNoteString(quarterNotes[i])} </button>
            <button
              className={"btn btn-outline-secondary w-75 py-0 rounded-0"}
              onClick={()=>dispatch(shiftQuarterNote({position:i,shift:-1}))}
            > {"∨"} </button>
          </Col>
        </Row>
      </Col>
    )
  }

  let rowButton4n=[]
  for(let i=0;i<button4n.length;i++){
    let actualRowLength = rowLength + 2
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
      <Col xs={12} className={"px-sm-0 px-4 mx-sm-0 mb-2"} id="ParentOfTimeAndButton">
        <Row className={"justify-content-center"} id="row">
          <Col xs={12} lg={12} className={"px-sm-0 py-sm-0 text-start offset-sm-2"}>
            {timeString}-
          </Col>
        </Row>
        <Row xs={12} className={"px-0 mx-0"} id='row2'>
          {rowButton4n[i]}
        </Row>
      </Col>

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

  let playStopLabel = (isPlay) ? faPause : faPlay
  let globalPlayStopLabel =(isPlay)? faPauseCircle:faPlayCircle

  return (
    <div className={"mb-5"}>
    <Container className={"justify-content-center mb-4 px-0"}>
        <Row id="seekbars" className={"text-left justify-content-center"}>
          <Col xs={12} className={"mb-2"}>Load your music file. Or you can test sample music file</Col>
          <Col xs={12} className={"mb-4"}>
            <input
              type="file"
              ref={uploadFile}
              onChange={()=>dispatch(fileInput(uploadFile))}
            />
          </Col>
          <Col xs={8} md={6}>
            Advanced settings. Expand play range
            <Row>
              <Col className={"px-0"} >
                <span
                  className="input-group-text px-1" id="inputGroup-sizing-sm">
                   Before
                </span>
              </Col>
              <Col  >
                <input
                  type="number"
                  className="form-control"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-sm"
                  defaultValue={0}
                  type="number"
                  step='0.1'
                  onChange={(e) => dispatch(changeExpandBefore(e.target.value))}
                />
              </Col>
              <Col className={"px-0"}>
                <span
                  className="input-group-text px-1" id="inputGroup-sizing-sm">
                  After
                </span>
              </Col>
              <Col>
                <input
                  type="number"
                  className="form-control"
                  aria-label="Sizing example input"
                  aria-describedby="inputGroup-sizing-sm"
                  defaultValue={0}
                  type="number"
                  step='0.1'
                  onChange={(e) => dispatch(changeExpandAfter(e.target.value))}
                />
              </Col>
            </Row>

          </Col>
        </Row>
      <Row className={"justify-content-center"}>
        <Col xs={12} sm={12} lg={10} className={"px-0 mx-0"}>
          <Row>
            {allRowButton4n}
          </Row>
        </Col>
      </Row>
      <Row className={"my-5"}>
        <Col></Col>
      </Row>
    </Container>

    <Container className={"mt-4"} id={"footer"}>
        <Row className="navbar navbar-light bg-light fixed-bottom">
          <Col className="offset-sm-0 offset-md-0 offset-lg-0" xs={12} sm={12} md={12}>
            <Row className="px-1 mx-0 justify-content-center">
              <Col xs={2} sm={2} md={1} id={'resumeButton'}>
                <FontAwesomeIcon
                  icon={globalPlayStopLabel}
                  size={"4x"}
                  color={"#0077ff"}
                 onClick={()=>dispatch(switchPlay())}
                />


              </Col>
              <Col xs={6} sm={7} md={3} className={"mb-2"}>
                <div>
                  <input
                    id="typeinp"
                    type="range"
                    className={""}
                    style={{'width':100+'%'}}
                    min="0"
                    max="100"
                    defaultValue={activePosition}
                    value={activePosition/numberOf4n*100}
                    //onChange={(e)=>console.debug(e)}
                    onChange={(e)=>dispatch(moveSeek(Math.floor(numberOf4n*Number(e.target.value)/100)))}
                    step="1"
                  />
                </div>
                <div>
                  <FontAwesomeIcon
                    icon={playStopLabel}
                    color={"#179317"}
                    size={"2x"}
                    className={"my-0 py-0 mx-1"}
                    onClick={()=>dispatch(switchPlayBySeek())}
                  />
                  <FontAwesomeIcon
                    icon={faFileAudio}
                    size={"2x"}
                    color={"#179317"}
                  />
                  <span
                    style={{
                        marginLeft: 5 + "px",
                        ...fontObject(0.1,4,1)
                      }}
                  >
                  {timeColoned(audioLength*activePosition/numberOf4n)}
                  {" / "}
                  {timeColoned(audioLength)}
                </span>
                </div>
              </Col>
              <Col xs={4} sm={3} md={2} className={"form-check form-switch text-left px-0"}>
                <ToggleLoop />
                <ToggleSynth />
              </Col>
              <Col xs={4} sm={4} md={3} className={"form-check form-switch"}>
                <InputBPM />
                <Volume />
              </Col>
              <Col xs={8} sm={8} md={3} className={"form-check form-switch"}>
                <Row>
                  <Col xs={6} md={12}>
                    <InputCuePoint />
                  </Col>
                  <Col xs={6} md={12}>
                    <ChangeSpeed />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
    );
}
