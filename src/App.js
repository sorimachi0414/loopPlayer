import React, {useRef, useState} from 'react';
import logo from './logo.png';
import { Counter } from './features/counter/Counter';
import { Footer } from './features/footer/Footer';
import './App.css';

function App() {
  return (

    <div className="App">
      <h1>Section Loop Player</h1>
      <img src={logo} className="img-fluid App-logo"　 alt="logo" />
        <Counter />
        <Footer />
    </div>
  );
}

export default App;
