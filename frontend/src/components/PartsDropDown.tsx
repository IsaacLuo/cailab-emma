import * as React from 'react'
import {Dropdown, Button} from 'react-bootstrap';
import {SHORTCUTS} from '../graphElements';
import styled from 'styled-components';

import STORE_PARTS from '../parts.json';

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

interface IProps {
  parts: any[],
  onClickNext?: (selectedParts:any)=>void,
}
interface IState {
  selectedParts: any[],
}

export default class PartsDropDown extends React.Component<IProps, IState> {
  constructor (props:IProps) {
    super(props);
    this.state = {
      selectedParts: props.parts.map(v=>({ctype: v}))
    }
  }
  public componentWillReceiveProps(newProps: IProps) {
    this.setState({
      selectedParts: newProps.parts.map(v=>({ctype: v}))
    })
  }
  public componentDidMount() {
    
  }
  public componentDidUpdate() {
    
  }
  public render() {
    const storeParts:any = STORE_PARTS;
    console.log(this.props.parts);
    const {parts} = this.props;
    const {selectedParts} = this.state;
    return <Panel>
      {selectedParts.map((v,i)=>
        <SelectionRow key={i}>
          <SVGIcon>
            {
              v.ctype.svg.map((vv:any, j:number)=>
                <img
                  style={{width:50, height:50}}
                  key={`${i}.${j}`} src={vv}
                />
              )
            }
          </SVGIcon>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {v.selected ? v.selected.name : 'select'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {storeParts[v.ctype.idx].parts.map((part:any,j:number) => 
                <Dropdown.Item
                  key={j}
                  onClick={this.onClickSelectedPart.bind(this, i, v.ctype.idx, part)}
                >
                  {part.name}
                </Dropdown.Item>)}
              
            </Dropdown.Menu>
          </Dropdown>
        </SelectionRow>
      )}
      {selectedParts.every(v=>v.selected) && 
        <div>
          <Button variant="primary" size="lg" onClick={this.onClickNext}>next</Button>
        </div>
      }
    </Panel>
  }
  private onClickSelectedPart = (slot:number, idx:number, part:any) => {
    console.log(idx, part);
    this.state.selectedParts[slot].selected = part;
    this.forceUpdate();
  }
  private onClickNext = () => {
    if(this.props.onClickNext){
      this.props.onClickNext(this.state.selectedParts);
    }
  }
}