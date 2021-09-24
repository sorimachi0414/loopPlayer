import React, {useRef, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";
import {timeColoned, toNoteString} from '../../index'
import * as Tone from 'tone'
import 'bootstrap/dist/css/bootstrap.min.css';
import Popover from "react-bootstrap/Popover"

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

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
  playBySeek, clickedPosition,
  switchPlayBySeek, moveSeek, changeExpandAfter, changeExpandBefore, changeSpeed, changeVolume, setClickedPosition,
} from './counterSlice';
import styles from './Counter.module.css';
import {Container, Row, Col, Button,Overlay} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPause, faPauseCircle, faPlay, faPlayCircle, faStop,faCoffee} from "@fortawesome/free-solid-svg-icons";
import {faFileAudio} from "@fortawesome/free-regular-svg-icons";
import {faCogs} from "@fortawesome/free-solid-svg-icons/faCogs";
import {faVolumeUp} from "@fortawesome/free-solid-svg-icons/faVolumeUp";
import {faPowerOff} from "@fortawesome/free-solid-svg-icons/faPowerOff";
import {faClock} from "@fortawesome/free-regular-svg-icons/faClock";

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


//export let player
export function Counter() {

  const rowLength=8
  const loaded =useSelector((state) => state.counter.loaded)
  const count = useSelector(selectCount);
  const expand = useSelector((state) => state.counter.expand)
  const numberOf4n = useSelector((state) => state.counter.numberOf4n)
  const activePosition = useSelector((state) => state.counter.activePosition)
  const clickedPosition = useSelector((state) => state.counter.clickedPosition)
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
            <FontAwesomeIcon icon={faClock}/>{timeString}-
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
      dispatch(playThis({a:clickedPosition+1,b:clickedPosition+2}))
      dispatch(shiftActivePosition(clickedPosition + 1))
      dispatch(setClickedPosition(clickedPosition + 1))
      event.preventDefault()
    }else if (event.code=='ArrowLeft') {
      dispatch(playThis({a:clickedPosition-1,b:clickedPosition}))
      dispatch(shiftActivePosition(clickedPosition - 1))
      dispatch(setClickedPosition(clickedPosition - 1))
      event.preventDefault()
    }else if (event.code=='ArrowUp') {
      dispatch(shiftQuarterNote({position:clickedPosition,shift:1}))
      //dispatch(shiftActivePosition(activePosition - 1))
      event.preventDefault()
    }else if (event.code=='ArrowDown') {
      dispatch(shiftQuarterNote({position:clickedPosition,shift:-1}))
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
    <Container className={"justify-content-center mb-4"}>
        <Row id="intro" className={"text-left justify-content-center bg-success text-light mb-2 p-2"}>
          <Col xs={12} sm={"auto"} className={" align-self-center"}>
            <FontAwesomeIcon
              icon={faPowerOff}
              size={"1.4rem"}
            />
            <span className={"fw-bold px-2"} style={{fontSize:"1.2rem"}}>
              Get started
            </span>

          </Col>
          <Col xs={12} sm={6} className={""}>
            <Row>
              <Col xs={12} className={" "}>
                Load your music file. Or you can test sample music file
              </Col>
              <Col xs={12} className={""}>
                <input
                  type="file"
                  ref={uploadFile}
                  onChange={()=>dispatch(fileInput(uploadFile))}
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
      //Container
    </div>
    );
}
