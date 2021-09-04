import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import {Provider, useSelector} from 'react-redux';
import * as serviceWorker from './serviceWorker';

//
import * as Tone from 'tone'
import music from "./music2.mp3";
import {build, select4n, selectCount} from "./features/counter/counterSlice";
//Tone.js------------------------------
let musicLength=0
let tempo,note4n,note1m,note2m

let musicOnLoad=()=>{
  console.log(player.loaded)
  console.log('loaded')

  musicLength = player.buffer.duration
  tempo=130
  note4n = 60/tempo
  note1m = 4*60/tempo
  note2m = 2*4*60/tempo
  /*
  let numberOf4n=Math.ceil(musicLength*tempo/60)
  console.log(numberOf4n)
   */
  store.dispatch(build(musicLength))
  //dispatch(build(numberOf4n))
}
export const player = new Tone.Player(music,()=>musicOnLoad()).toDestination();
player.loop = true;
player.autostart = false;


//------------


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
