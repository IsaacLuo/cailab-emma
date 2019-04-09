import * as React from 'react'
import {Dropdown, Button, Table} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'
import {IFeature, DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

const SelectionRow = styled.div`
  display:flex;
`;
const SVGIcon = styled.div`
  width:220px;
`;

const RedSpan = styled.span`
  color:red;
`;

interface IProps {
  selectedParts: any[],
  selectedShortcuts: any[],
  onClickNext?: (selectedParts:any)=>void,
}
interface IState {
  finalParts: any[],
  genbank: string,
}

export default class Assemble extends React.Component<IProps, IState> {
  constructor (props:IProps) {
    super(props); 
  }
  public componentWillMount() {
    this.mergeParts();
  }
  public componentWillUpdate() {
    this.mergeParts();
  }
  public render() {
    const {finalParts} = this.state;

    return <Panel>
      <Table striped={true} bordered={true} hover={true}>
        <thead>
          <tr>
            <th>name</th>
            <th>sequence</th>
          </tr>
        </thead>
        <tbody>
          {finalParts.map((v,i)=>
              <tr key={i}>
                <td>{v.name}</td>
                <td>
                  <RedSpan>
                    {v.sequence.substr(0,4)}
                  </RedSpan>
                  {v.sequence.substring(4, v.sequence.length-4)}
                  <RedSpan>
                    {v.sequence.substr(v.sequence.length-4,4)}
                  </RedSpan>
                  </td>
              </tr>)}
          <tr>
          </tr>
        </tbody>
      </Table>
      <div>
        <Button variant="primary" size="lg" onClick={this.downloadGenbank}>download genbank</Button>
      </div>
    </Panel>
  }

  private mergeParts () {
    const shortCuts = this.props.selectedShortcuts.map(v=>CONNECTORS[v.idx]);
    const {selectedParts} = this.props;

    // merge sort
    let i=0;
    let j=0;
    const re = [];

    while(i<shortCuts.length && j<selectedParts.length) {
      const idxI = shortCuts[i].pos[0];
      const idxJ = selectedParts[j].ctype.idx;
      if (idxI < idxJ) {
        re.push({name: shortCuts[i].name, sequence: shortCuts[i].sequence})
        i++;
      } else {
        re.push({name: selectedParts[j].selected.name, sequence: selectedParts[j].selected.sequence})
        j++;
      }
    }

    while(i<shortCuts.length) {
      re.push({name: shortCuts[i].name, sequence: shortCuts[i].sequence})
      i++;
    }
    while(j<selectedParts.length) {
      re.push({name: selectedParts[j].selected.name, sequence: selectedParts[j].selected.sequence})
      j++;
    }

    this.setState({finalParts: re, genbank: this.generateGenbank(re)});
    
  }

  private generateGenbank (parts:any[]) {
    const dnaSeq = new DNASeq({
      sequence: vectorReceiver.seqeunce,
      features: vectorReceiver.features,
    });

    parts.forEach(part => {
      
      const sequence = part.sequence.substr(0,part.sequence.length-4);
      const begin = dnaSeq.sequence.length;

      dnaSeq.sequence += sequence;
      dnaSeq.features.push({
        from: begin+4,
        to: begin + sequence.length,
        strand: '.',
        ctype: 'misc_feature',
        label: part.name,
      });

    })

    return dnaSeq.toGenbank();
  }

  private downloadGenbank = () => {
    const {genbank} = this.state;
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([genbank], {type: 'text/plain'}));
    a.download = 'result.gb';

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  }
}