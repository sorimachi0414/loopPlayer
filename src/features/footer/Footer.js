import {faPause, faPauseCircle, faPlay, faPlayCircle} from "@fortawesome/free-solid-svg-icons";
import {useDispatch, useSelector} from "react-redux";
import {Col, Container, Overlay, Row} from "react-bootstrap";
import {
  changeBpm, changeExpandAfter,
  changeExpandBefore,
  changeSpeed,
  changeVolume,
  changeWait, moveSeek, selectCount,
  switchLoop, switchPlay, switchPlayBySeek,
  switchPlaySynth
} from "../counter/counterSlice";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVolumeUp} from "@fortawesome/free-solid-svg-icons/faVolumeUp";
import * as Tone from "tone";
import React, {useRef, useState} from "react";
import {faCogs} from "@fortawesome/free-solid-svg-icons/faCogs";
import {faFileAudio} from "@fortawesome/free-regular-svg-icons";
import {timeColoned} from "../../index";

let lastClick=0
let tempo = 100

let fontObject =(min,nom,max)=> {
  let result = {
    "font-size":`clamp(${min}rem,${nom}vw,${max}rem)`}
  return result
}

let playStopLabel = (true) ? faPause : faPlay
let globalPlayStopLabel =(true)? faPauseCircle:faPlayCircle


const ChangeSpeed=()=>{
  const dispatch = useDispatch();
  const speed = useSelector((state) => state.counter.speed)



  return(
    <Row>
      <Col className={""}>
        <span
          className="input-group-text px-1" id="inputGroup-sizing-sm"
        >
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
      <Col  className={""}>
        <span
          className="input-group-text px-1" id="inputGroup-sizing-sm"
        >
          Cue point [s]
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
    <Row className={"px-0"}>
      <Col className={"col-auto px-0"}>
        <span
          style={{
            ...fontObject(0.5,2,1),
            color:"#ccc",
          }}
          className="input-group-text px-2"
          id="inputGroup-sizing-sm"
        >.
          <FontAwesomeIcon
            icon={faVolumeUp}
            size={"1x"}
            color={"#888"}
          />

        </span>
      </Col>
      <Col xs={"auto px-0"}>
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
      <Col className={"col-auto px-0"}>
        <TapTempo />
      </Col>
      <Col xs={"auto px-0"}>
        <input
          type="number"
          className="form-control"
          aria-label="Sizing example input"
          aria-describedby="inputGroup-sizing-sm"
          defaultValue={bpm}
          value={bpm}
          size={3}
          style={{
            maxWidth:"5rem",
            ...fontObject(0.5,2,1)
          }}
          onChange={(e) => dispatch(changeBpm(e.target.value))}
        />
      </Col>
    </Row>
  )

}

const TapTempo=()=>{
  const dispatch = useDispatch();

  let calcTempo=()=>{
    let lastTempo = tempo
    let thisClick = Tone.now()
    let interval = thisClick - lastClick
    interval = (interval<12) ? interval : 12
    let newTempo = 60 / interval

    tempo = Math.round((lastTempo+newTempo)/2)
    lastClick = thisClick
    return tempo
  }

  return(
    <button
      className={"btn btn-outline-secondary mx-0 px-1"}
      type="button"
      id="button-addon1"
      style={fontObject(0.5,2,1)}
      onClick={() =>{
          tempo = calcTempo()
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
    <div className={"text-start"}>
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
        className={"form-check-label text-left ms-1"}
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
    <div className={"text-start"}>
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
        className={"form-check-label ms-1"}
        htmlFor={"synth"}
        style={fontObject(0.5,2,1)}
      >
        Soft piano
      </label>
    </div>
  )
}


const PopContent =()=> {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <>
      <a tabIndex={0} className={"btn btn-outline-dark p-1 p-sm-2"} ref={target} onClick={() => setShow(!show)}>
        <FontAwesomeIcon
          icon={faCogs}
          style={{
            fontSize:"clamp(1rem,5vw,2rem)",
          }}
          color={"#888"}
        />
      </a>
      <Overlay
        target={target.current}
        show={show}
        placement="top"
      >
        {({ placement, arrowProps, show: _show, popper, ...props }) => (
          <Container>
            <Row>
              <Col
                {...props}
                style={{
                  backgroundColor: 'rgba(255,255,255, 0.9)',
                  padding: '',
                  color: 'black',
                  borderRadius: 3,
                  border:"solid 1px #000",
                  maxWidth:'50%',
                  ...props.style,
                }}
                className={"mb-2"}
                xs={7}
                sm={6}
                md={4}
                lg={3}
                xl={2}
              >
                <Row>
                  <Col className={"text-start"}>
                    <b>Additional Settings</b>
                  </Col>
                  <Col xs={12} className={""}>
                    <Row className={"px-2"}>

                      <Col xs={12}>
                        Expand play range.
                      </Col>

                      <Col xs={"auto"} id={"1ofRow"}>
                        <Row>
                          <Col>
                                <span
                                  className="input-group-text px-1" id="inputGroup-sizing-sm">
                                   Before [s]
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
                              min={0}
                              onChange={(e) => dispatch(changeExpandBefore(e.target.value))}
                            />
                          </Col>
                        </Row>
                      </Col>

                      <Col xs={"auto"} className={"pb-2"}>
                        <Row>
                          <Col className={""}>
                                <span
                                  className="input-group-text px-1" id="inputGroup-sizing-sm">
                                  After [s]
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
                              min={0}
                              onChange={(e) => dispatch(changeExpandAfter(e.target.value))}
                            />
                          </Col>
                        </Row>
                      </Col>

                      <Col xs={12}>
                        Change the beginning point.
                      </Col>
                      <Col xs={"auto"} className={"pb-2"}>
                        <InputCuePoint />
                      </Col>

                      <Col xs={12}>
                        Slow down the music speed.
                        0.5/ 0.75/ 1.0
                      </Col>
                      <Col xs={"auto"} className={"pb-2"}>
                        <ChangeSpeed />
                      </Col>

                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        )}
      </Overlay>
    </>
  );
}



export function Footer() {
  const dispatch = useDispatch();
  const rowLength=8
  const loaded =useSelector((state) => state.counter.loaded)
  const count = useSelector(selectCount);
  const expand = useSelector((state) => state.counter.expand)
  const numberOf4n = useSelector((state) => state.counter.numberOf4n)
  const activePosition = useSelector((state) => state.counter.activePosition)
  const clickedPosition = useSelector((state) => state.counter.clickedPosition)
  const quarterNotes = useSelector((state) => state.counter.quarterNotes)
  const audioLength = useSelector((state) => state.counter.musicLength)
  const positionSec = useSelector((state) => state.counter.positionSec)
  const isPlay = useSelector((state) => state.counter.isPlay)

  const [incrementAmount,setIncrementAmount,keyPosition,setKeyPosition] = useState(0);
  let playStopLabel = (isPlay) ? faPause : faPlay
  let globalPlayStopLabel =(isPlay)? faPauseCircle:faPlayCircle

  return(

    <Container className={"mt-4"} id={"footer"}>
      <Row className="navbar navbar-light bg-light fixed-bottom">
        <Col className="offset-sm-0 offset-md-0 offset-lg-0" xs={12} sm={12} md={12}>
          <Row className="px-1 mx-0 justify-content-center">

            <Col xs={2} sm={2} md={1} id={'resumeButton'}>
              <FontAwesomeIcon
                icon={globalPlayStopLabel}
                style={{
                  fontSize:"clamp(2rem,10vw,4rem)",
                }}
                color={"#0077ff"}
                onClick={()=>dispatch(switchPlay())}
              />
            </Col>
            <Col xs={5} sm={5} md={3} lg={4} className={"mb-2"}>
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
                <button
                  className={"btn btn-outline-dark p-1"}
                  onClick={()=>dispatch(switchPlayBySeek())}
                >
                  //TODO change icon to |<
                  <FontAwesomeIcon
                    icon={playStopLabel}
                    color={"#179317"}
                    size={"2x"}
                    style={fontObject(1,3,2)}
                    className={"my-0 py-0 mx-1"}
                  />
                  <FontAwesomeIcon
                    icon={faFileAudio}
                    size={"2x"}
                    style={fontObject(1,3,2)}

                    color={"#179317"}
                  />
                </button>
                <span
                  style={{
                    marginLeft: 5 + "px",
                    ...fontObject(0.1,4,0.8)
                  }}
                >
                  {timeColoned(audioLength*activePosition/numberOf4n)}
                  {" / "}
                  {timeColoned(audioLength)}
                </span>
              </div>
            </Col>
            <Col xs={3} sm={3} md={2} className={"form-check form-switch text-left px-0"}>
              <ToggleLoop />
              <ToggleSynth />
            </Col>
            <Col xs={"auto"} sm={4} md={3} lg={2} className={" order-2 order-md-1"}>
              <InputBPM />
            </Col>
            <Col xs={"auto"} sm={4} md={2} lg={2} className={"  order-3 order-md-2"}>
              <Volume />
            </Col>
            <Col xs={2} sm={2} md={1} lg={1} className={" p-0 order-1 order-md-3"}>
              <PopContent />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )

}