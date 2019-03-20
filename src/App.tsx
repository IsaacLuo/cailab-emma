import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PartSelector from './components/PartsSelector'

class App extends Component {

  public render() {
    return (
      <div className="App">
        <PartSelector/>
      </div>
    );
  }
}

export default App;
