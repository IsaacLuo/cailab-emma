import { IProject, IStoreState, IPartDetail } from '../types';

import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';
import {
  SHOW_LOGIN_WINDOW,
  LOGOUT,
  GET_CURENT_USER,
  GET_PROJECT,
  SAVE_PROJECT_HISTORY,
  SET_CURRENT_PROJECT,
  SET_PART_DETAIL,
} from '../redux/actions';
import {Dropdown, Button, Breadcrumb} from 'react-bootstrap';
import {SHORTCUTS} from '../graphElements';
import styled from 'styled-components';

import STORE_PARTS from '../parts.json';
import PART_NAMES from '../partNames';
import { Link } from 'react-router-dom';



const Panel = styled.div`
  margin:100px;
  text-align:left;
  flex: 1;
`;

const SelectionRow = styled.div`
  display:flex;
  margin-bottom: 1em;
`;
const SVGIcon = styled.div`
  width:220px;
  flex: 2;
`;

const GrayDescription = styled.div`
  color:#777;
`;

const PositionTitle = styled.div`
  margin-top:10px;
  margin-right:10px;
  width: 100px;
`;

const PartDetailDescription = styled.div`
  margin: 10px;
`

const DropdownPanel = styled.div`
  text-align:left;
  flex: 4;
`;

interface IProps extends RouteComponentProps {
  project: IProject;
  onLoadProject: (projectId: string) => void;
  setPartDetail: (position: number, detal:IPartDetail) => void;
  saveProjectHistory: (project: IProject) => void;
}
interface IState {
  nextButtonVisible: boolean;
  readyToSaveProjectHistory: boolean;
  // pos8Ignored: boolean;
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
  setPartDetail: (position: number, detail:IPartDetail) => dispatch({type: SET_PART_DETAIL, data: {position, detail}}),
  saveProjectHistory: (project: IProject) => dispatch({type:SAVE_PROJECT_HISTORY, data: project}),
});

class PartsDropDown extends React.Component<IProps, IState> {
  
  public static getDerivedStateFromProps (nextProps: IProps, prevState: IState) {
    // let pos8Ignored:boolean = !!(nextProps.project.parts[7].selected && nextProps.project.parts[7].partDetail && nextProps.project.parts[7].partDetail.len === 2);

    const nextButtonVisible = nextProps.project.parts.every(
      (part)=> part.selected && part.partDetail!==undefined || !part.selected
    );

    const readyToSaveProjectHistory = (nextButtonVisible && !prevState.nextButtonVisible) 
    return {
      ...prevState,
      nextButtonVisible,
      readyToSaveProjectHistory,
      // pos8Ignored,
    };
  }

  constructor (props:IProps) {
    super(props);

    const projectId = (this.props.match.params as any).id;
    if (projectId && this.props.project._id !== projectId) {
      this.props.onLoadProject(projectId);
    }
    this.state = {
      nextButtonVisible: false,
      readyToSaveProjectHistory: false,
      // pos8Ignored: false,
    }
  }

  public render() {
    const storeParts:any = STORE_PARTS;
    // console.log(this.props.parts);
    const {parts} = this.props.project;
    return <React.Fragment>
            <Breadcrumb>
        <Breadcrumb.Item href='/projects'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/project/${this.props.project._id}`}>step 1</Breadcrumb.Item>
        <Breadcrumb.Item active>step 2: select parts ({this.props.project.name})</Breadcrumb.Item>
      </Breadcrumb>
      <Panel>
      {parts.map((part,i)=>
      <React.Fragment key={i}>
        {part.selected &&
          (part.partName === 'ignored'
          ?
          <SelectionRow>position 9 is disabled</SelectionRow>
          : 
          <SelectionRow >
            <PositionTitle>position {i+1}</PositionTitle>
            <SVGIcon>  
              {
                PART_NAMES[i].filter(()=>part.selected).map((partDesc, j) =>
                  <img
                    style={{width:50, height:50}}
                    key={`${i}.${j}`}
                    src={partDesc.icon}
                  />
                )
              }
              {
                PART_NAMES[i].filter(()=>part.selected).map((partDesc, j) =>
                <GrayDescription key={j}>{partDesc.title}</GrayDescription>
                )
              }
            </SVGIcon>
            <DropdownPanel>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {part.partDetail && part.partDetail.name || 'select'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {storeParts[i].parts.map((sample:any,j:number) => 
                    <Dropdown.Item
                      key={j}
                      onClick={this.onClickSelectedPart.bind(this, i, sample)}
                    >
                      {sample.name}
                    </Dropdown.Item>)}
                  
                </Dropdown.Menu>
              </Dropdown>
              <PartDetailDescription>
                {part.partDetail && part.partDetail.comment}
              </PartDetailDescription>
            </DropdownPanel>
          </SelectionRow>
          )
        }
        </React.Fragment>
      )}
      {this.state.nextButtonVisible &&
        <div>
          <Link to={`/project/${(this.props.match.params as any).id}/step3`}>
          <Button variant="primary" size="lg" onClick={this.onClickNext}>next</Button>
          </Link>
        </div>
      }
    </Panel>
      </React.Fragment>
  }

  public componentDidUpdate () {
    const {readyToSaveProjectHistory} = this.state;
    if (readyToSaveProjectHistory) {
      this.props.saveProjectHistory(this.props.project);
    }
  }
  private onClickSelectedPart = (position:number, detail:IPartDetail) => {
    console.log(position,detail);
    this.props.setPartDetail(position, detail);
    // this.state.selectedParts[slot].selected = part;
    
  }
  private onClickNext = () => {
    // if(this.props.onClickNext){
    //   this.props.onClickNext(this.state.selectedParts);
    // }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PartsDropDown));