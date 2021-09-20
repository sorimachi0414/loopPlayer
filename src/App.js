import React from 'react';
import logo from './logo.png';
import { Counter } from './features/counter/Counter';
import './App.css';
import {Container,Row,Col} from "react-bootstrap";


function App() {
  return (

    <div className="App">
      <h1>Section Loop Player</h1>
      <img src={logo} className="img-fluid App-logo"　 alt="logo" />
        <Counter />
    </div>
  );
  //<img src={logo} className="App-logo" alt="logo" />
}

export default App;
