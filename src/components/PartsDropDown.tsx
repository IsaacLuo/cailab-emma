import * as React from 'react'
import {Dropdown} from 'react-bootstrap';
import {SHORTCUTS} from '../graphElements';
import styled from 'styled-components';

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
}
interface IState {
}

export default class PartsDropDown extends React.Component<IProps, IState> {
  constructor (props:IProps) {
    super(props);    
  }
  public componentDidMount() {
    
  }
  public componentDidUpdate() {
    
  }
  public render() {
    console.log(this.props.parts);
    const {parts} = this.props;
    return <Panel>
      {parts.map((v,i)=>
        <SelectionRow key={i}>
          <SVGIcon>
            {
              v.svg.map((vv:any, j:number)=>
                <img
                  style={{width:50, height:50}}
                  key={`${i}.${j}`} src={vv}
                />
              )
            }
          </SVGIcon>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Select
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </SelectionRow>
      )}
    </Panel>
  }
}