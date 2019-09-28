import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter} from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {Button, Form, Breadcrumb} from 'react-bootstrap';
import { 
  SET_CURRENT_PROJECT, 
  GET_MY_PROJECTS, 
  POST_ASSEMBLY_LIST,
  SET_ASSEMBLY_LIST_ID,
} from '../redux/actions';
import qs from 'qs';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  projects: IProject[];
  assemblyListId?: string;
  getMyProjects: ()=>void;
  onLoadProject: (project: IProject) => void;
  onSaveAssemblyList: (projectIds:string[])=>Promise<any>;
  resetAssemblyList:()=>void;
}
interface IState {
  projectName: string;
  validProjects: IProject[];
  projects: IProject[];
  checkedProjectIds: boolean[];
  preselected: string[];
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  projects: state.app.myProjects,
  assemblyListId: state.app.assemblyListId,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getMyProjects: () => dispatch({type:GET_MY_PROJECTS}),
  onLoadProject: (project: IProject) => dispatch({type: SET_CURRENT_PROJECT, data: project}),
  onSaveAssemblyList: async (projectIds: string[]) => new Promise((resolve:any)=>dispatch({type:POST_ASSEMBLY_LIST, data: projectIds, cb:resolve,})),
  resetAssemblyList: ()=>dispatch({type:SET_ASSEMBLY_LIST_ID, data:undefined}),
});

class GenerateProtocols extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps(props: IProps, state: IState) {

    // if (props.projects.length !== state.projects.length) {
      const validProjects = props.projects.filter(v=>v.assemblies);
      const newState = {
        ...state,
        validProjects,
        projects:props.projects,
      };
      if (state.preselected) {
        newState.checkedProjectIds = validProjects.map(v=>v._id ? state.preselected.indexOf(v._id)>=0 : false);
      }
      return newState;
  }

  constructor(props: IProps) {
    super(props);
    this.props.resetAssemblyList();
    const checkedProjectIds:any = props.projects.map(v=>false);
    const queryObj = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });

    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      validProjects: props.projects.filter(v=>v.assemblies),
      checkedProjectIds,
      projects: props.projects,
      preselected: queryObj.preselected,
    };
  }

  public componentDidMount() {
    
    if (this.props.currentUser._id) {
      this.getProjectList();
    }
  }

  public shouldComponentUpdate(np: IProps, ns: IState) {
    if (np.currentUser !== this.props.currentUser && np.currentUser._id) {
      this.getProjectList();
    }
    return true;
  }

  public render() {
    return (
      <Panel>
        <Breadcrumb>
          <Breadcrumb.Item href='/projects'>Home</Breadcrumb.Item>
          <Breadcrumb.Item active>select projects</Breadcrumb.Item>
        </Breadcrumb>

        <div style={{marginTop:30}}>
          <h3>select projects to genterate automatic protocols</h3>
          <Form>
            {this.state.validProjects.map((v, i) => 
            v._id ?
            <div key={i}>
              <Form.Group controlId={v._id}>
              <Form.Check 
                type={'checkbox'}
                label={`${v.name}`}
                checked={this.state.checkedProjectIds[i]}
                onChange={(event:React.ChangeEvent<HTMLInputElement>)=>{
                  const checkedProjectIds = [...this.state.checkedProjectIds];
                  checkedProjectIds[i] = event.target.checked;
                  console.log(checkedProjectIds);
                  this.setState({checkedProjectIds})
                  }}
              />
                {/* <span>{v.name}</span> */}
                {/* {v.updatedAt && <span style={{color: '#777', fontSize: '80%'}}> {v.updatedAt.toLocaleDateString()}</span>} */}
              </Form.Group>
            </div> : <div>...</div>
            )}
          </Form>
          {this.state.checkedProjectIds.find(v=>v) && <Button onClick={this.onClickNext}>Generate</Button>}
        </div>
        
      </Panel>
    );
  }

  public componentWillUnmount() {
  }

  private onClickNext = () => {
    const projectIds = this.state.validProjects.map(v=>v._id!).filter((v,i)=>this.state.checkedProjectIds[i]);
    this.props.onSaveAssemblyList(projectIds).then(
      (listId:string) => this.props.history.push(`/protocolList/${listId}`)
    );
  }

  private async getProjectList() {
    this.props.getMyProjects();
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GenerateProtocols));
