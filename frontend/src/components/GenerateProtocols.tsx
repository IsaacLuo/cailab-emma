import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {Button, InputGroup, FormControl, FormControlProps, Form} from 'react-bootstrap';
import { listMyProjects } from '../backendCalls';
import { SET_CURRENT_PROJECT, CREATE_PROJECT, GET_MY_PROJECTS, DELETE_PROJECT, POST_ASSEMBLY_LIST} from '../redux/actions';
import ProjectWizard from './ProjectWizard';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const CloseButton = styled(Button)`
  margin-left:5px;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  projects: IProject[];
  getMyProjects: ()=>void;
  onLoadProject: (project: IProject) => void;
  onSaveAssemblyList: (projectIds:string[])=>void;
}
interface IState {
  projectName: string;
  validProjects: IProject[];
  projects: IProject[];
  checkedProjectIds: boolean[];
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  projects: state.app.myProjects,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getMyProjects: () => dispatch({type:GET_MY_PROJECTS}),
  onLoadProject: (project: IProject) => dispatch({type: SET_CURRENT_PROJECT, data: project}),
  onSaveAssemblyList: (projectIds: string[]) => dispatch({type:POST_ASSEMBLY_LIST, data: projectIds}),
});

class GenerateProtocols extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps(props: IProps, state: IState) {
    if (props.projects.length !== state.projects.length) {
      const validProjects = props.projects.filter(v=>v.assemblies);
      return {
        ...state,
        validProjects,
        projects:props.projects,
        checkedProjectIds: validProjects.map(v=>false),
        }
    }
    return null;
  }

  constructor(props: IProps) {
    super(props);
    const checkedProjectIds:any = props.projects.map(v=>false)
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      validProjects: props.projects.filter(v=>v.assemblies),
      checkedProjectIds,
      projects: props.projects,
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
      return false;
    }
    return true;
  }

  public render() {
    return (
      <Panel>
        <div style={{marginTop:30}}>
          <h3>your projects</h3>
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
    console.log(projectIds);
    this.props.onSaveAssemblyList(projectIds);
  }

  private async getProjectList() {
    this.props.getMyProjects();
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GenerateProtocols));
