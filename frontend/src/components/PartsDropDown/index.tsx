import { IProject, IStoreState, IPartDetail, IPlatesListItem, IPlatesListItemWithDetail, IPartDefinition } from '../../types';

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
  GO_TO_STEP_3,
  GET_PLATE_LIST,
  SET_CURRENT_SELECTED_PLATE,
  GET_PLATE_DETAIL,
  GET_PART_DEFINITIONS,
} from '../../redux/actions';
import {Dropdown, Button, Breadcrumb} from 'react-bootstrap';
import {SHORTCUTS} from '../../graphElements';
import styled from 'styled-components';

import STORE_PARTS from '../../parts.json';
import PART_NAMES from '../../partNames';
import { Link } from 'react-router-dom';
import { AutoComplete, Input, Icon } from 'antd';
import { positionNames } from '../../utilities/positionNames';


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
  platesList: IPlatesListItem[];
  currentSelectedPlate?: IPlatesListItemWithDetail;
  currentAvailableParts: IPartDefinition[];
  
  onLoadProject: (projectId: string) => void;
  setPartDetail: (position: number, detal:IPartDetail) => void;
  saveProjectHistory: (project: IProject) => void;
  gotoStep3: (project: IProject, callback:()=>void) => void;
  // dispatchGetPlateList: ()=>void;
  // dispatchSetCurrentSelectedPlateId: (plateId:string)=>void;
  dispatchGetPartDefinitions:()=>void;
}
interface IState {
  nextButtonVisible: boolean;
  readyToSaveProjectHistory: boolean;
  searchString: any;
  // pos8Ignored: boolean;
}

const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
  platesList: state.app.platesList,
  currentSelectedPlate: state.app.currentSelectedPlate,
  currentAvailableParts: state.app.currentAvailableParts,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoadProject: (projectId: string) => dispatch({type: GET_PROJECT, data: projectId}),
  setPartDetail: (position: number, detail:IPartDetail) => dispatch({type: SET_PART_DETAIL, data: {position, detail}}),
  saveProjectHistory: (project: IProject) => dispatch({type:SAVE_PROJECT_HISTORY, data: project}),
  gotoStep3: (project: IProject, callback:()=>void) => dispatch({type:GO_TO_STEP_3, data: {project, callback}}),
  // dispatchGetPlateList: ()=>dispatch({type:GET_PLATE_LIST}),
  // dispatchSetCurrentSelectedPlateId: (plateId:string) => dispatch({type:GET_PLATE_DETAIL, data:plateId}),
  dispatchGetPartDefinitions: ()=> dispatch({type:GET_PART_DEFINITIONS}),
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
      searchString: {},
      // pos8Ignored: false,
    }

    this.props.dispatchGetPartDefinitions();
  }

  public componentDidMount() {
    // this.props.dispatchGetPlateList();
    
  }

  public render() {
    const storeParts:any = this.props.currentAvailableParts;
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
              <AutoComplete
                className="auto-complete"
                dropdownClassName="auto-compolete-dropdown"
                dropdownMatchSelectWidth={true}
                dropdownStyle={{ width: 300 }}
                size="large"
                style={{ width: '100%' }}
                dataSource={
                  storeParts
                  .filter((sample:any)=>sample && sample.part.position === positionNames[i])
                  .filter((sample:any)=> !this.state.searchString[i] || sample.part.name.toLowerCase().indexOf(this.state.searchString[i]) >= 0)
                  .map((sample:any,j:number) => 
                    <AutoComplete.Option value={sample.part.name as string} key={sample._id+j.toString() as string}>
                      {sample.part.name}
                    </AutoComplete.Option>)
                }
                placeholder="input here"
                optionLabelProp="value"
                onSearch={this.handleSearchPartName.bind(this, i)}
              >
                <Input suffix={<Icon type="search" className="certain-category-icon" />} />
              </AutoComplete>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {part.partDetail && part.partDetail.name || 'select'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {storeParts.filter((sample:any)=>sample && sample.part.position === positionNames[i]).map((sample:any,j:number) => 
                    <Dropdown.Item
                      key={j}
                      onClick={this.onClickSelectedPart.bind(this, i, sample)}
                    >
                      {sample.part.name}
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
          {/* <Link to={`/project/${(this.props.match.params as any).id}/step3`}> */}
          <Button variant="primary" size="lg" onClick={this.onClickNext}>next</Button>
          {/* </Link> */}
        </div>
      }
    </Panel>
      </React.Fragment>
  }

  public componentDidUpdate () {
    // const {readyToSaveProjectHistory} = this.state;
    // if (readyToSaveProjectHistory) {
      // this.props.saveProjectHistory(this.props.project);
    // }
  }

  private onClickSelectedPart = (position:number, detail:IPartDetail) => {
    console.log(position,detail);
    this.props.setPartDetail(position, detail);
    // this.state.selectedParts[slot].selected = part;
    
  }
  private onClickNext = () => {
    // save projectHistory
    this.props.gotoStep3(this.props.project, ()=>{
      this.props.history.push(`/project/${(this.props.match.params as any).id}/step3`);
    });
    // if(this.props.onClickNext){
    //   this.props.onClickNext(this.state.selectedParts);
    // }
    
  }

  private handleSearchPartName = (posIndex:number, searchStr:string) => {
    console.log(posIndex, searchStr);
    const {searchString} = this.state;
    this.setState({searchString: {...searchString, [posIndex]:searchStr.toLowerCase()}})
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PartsDropDown));