import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap.css';

import PartSelector from './components/PartsSelector'
import styled from 'styled-components'
import PartsDropDown from './components/PartsDropDown';
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
      selectedParts: JSON.parse(testString),
    }
  }

  public render() {
    return (
      <div className="App">
        <CenterDiv>
          {
            this.state.selectedParts.length > 0 
            ?
            <PartsDropDown parts={this.state.selectedParts}/>
            :
            <PartSelector
            onClickNext={this.onClickNext}
          />
          }
        </CenterDiv>
      </div>
    );
  }

  private onClickNext = (result:any) => {
    const {parts, shortcuts} = result;
    this.setState({selectedParts: parts});
  }
}

export default App;
