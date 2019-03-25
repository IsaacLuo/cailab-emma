import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap.css';

import PartSelector from './components/PartsSelector'
import styled from 'styled-components'
const CenterDiv = styled.div`
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
class App extends Component {

  public render() {
    return (
      <div className="App">
        <CenterDiv>
          <PartSelector
            onClickNext={this.onClickNext}
          />
        </CenterDiv>
      </div>
    );
  }

  private onClickNext = (result:any) => {
    console.log(result);
  }
}

export default App;
