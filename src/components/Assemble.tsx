import * as React from 'react'
import {Dropdown, Button, Table} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'

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
}

export default class Assemble extends React.Component<IProps, IState> {
  constructor (props:IProps) {
    super(props);
    
  }
  public componentWillReceiveProps(newProps: IProps) {
    
  }
  public componentDidMount() {
    
  }
  public componentDidUpdate() {
    
  }
  public render() {
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


    return <Panel>
      <Table striped={true} bordered={true} hover={true}>
        <thead>
          <tr>
            <th>name</th>
            <th>sequence</th>
          </tr>
        </thead>
        <tbody>
          {re.map((v,i)=>
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
    </Panel>
  }
}