import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap.css';

import PartSelector from './components/PartsSelector'
import styled from 'styled-components'
import PartsDropDown from './components/PartsDropDown';
import Assemble from './components/Assemble';
const CenterDiv = styled.div`
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

// const testString = `[{"idx":18,"svg":["/static/media/promoter.09f6b508.svg"]},{"idx":19,"svg":["/static/media/CDS.8af00582.svg"]},{"idx":20,"svg":["/static/media/p2A.77a9cf6a.svg","/static/media/Peptide linker.0fb922eb.svg","/static/media/IRES.c6b22784.svg","/static/media/Protein Tag.87a2ad06.svg"]},{"idx":21,"svg":["/static/media/CDS.8af00582.svg"]},{"idx":22,"svg":["/static/media/Terminator.f105c70e.svg"]}]`
const testString = `[]`

class App extends Component<any, any> {
  constructor(props:any) {
    super(props);
    this.state = {
      selectedSlots: JSON.parse(testString),
      selectedParts: [],
      selectedShortcuts: [],
    }
  }

  public render() {
    const {selectedParts, selectedShortcuts} = this.state;
    if(selectedParts.length > 0 ) {
      return (
        <div className="App">
          <Assemble
            selectedParts={selectedParts}
            selectedShortcuts={selectedShortcuts}
          />
          {selectedParts.map((v:any, i:number)=><div key={i}>
            {v.selected.name}
          </div>)}
        </div>
      )
    }
    return (
      <div className="App">
        <CenterDiv>
          {
            this.state.selectedSlots.length > 0 
            ?
            <PartsDropDown
              parts={this.state.selectedSlots}
              onClickNext={this.onFinishStep2}
            />
            :
            <PartSelector
              onClickNext={this.onFinishStep1}
          />
          }
        </CenterDiv>
      </div>
    );
  }

  private onFinishStep1 = (result:any) => {
    const {parts, shortcuts} = result;
    this.setState({selectedSlots: parts, selectedShortcuts: shortcuts});
  }

  private onFinishStep2 = (result:any) => {
    const parts = result;
    this.setState({selectedParts: parts});
  }
}

export default App;
