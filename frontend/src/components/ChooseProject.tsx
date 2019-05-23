import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {Button, InputGroup, FormControl, FormControlProps} from 'react-bootstrap';
import { listMyProjects } from '../backendCalls';
import { SET_CURRENT_PROJECT, CREATE_PROJECT, GET_MY_PROJECTS } from '../redux/actions';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  projects: IProject[];
  getMyProjects: ()=>void;
  onNewProject: (name:string, history:any) => void;
  onLoadProject: (project: IProject) => void;
}
interface IState {
  projectName: string;
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  projects: state.app.myProjects,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getMyProjects: () => dispatch({type:GET_MY_PROJECTS}),
  onNewProject: (name:string, history:any) => dispatch({type: CREATE_PROJECT, data:{name, history}}),
  onLoadProject: (project: IProject) => dispatch({type: SET_CURRENT_PROJECT, data: project}),
});

class ChooseProject extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
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
      <div>
        <InputGroup style={{width:600}}>
            <FormControl
              placeholder='filename'
              aria-label='filename'
              aria-describedby='filename'
              value={this.state.projectName}
              onChange={this.onChangeFileName}
            />
            <InputGroup.Append>
              <Button variant='outline-secondary' onClick={this.onClickNewProject}>new project</Button>
            </InputGroup.Append>
          </InputGroup>
        <div>
          {this.props.projects.map((v, i) =>
          <div key={i}>
            <Button variant='link' onClick={this.onClickOpenProject.bind(this, v)}>
              <span>{v.name}</span>
              {v.updatedAt && <span style={{color: '#777', fontSize: '80%'}}> {v.updatedAt.toLocaleDateString()}</span>}
            </Button>

          </div>,
          )}
        </div>
      </div>
    );
  }

  public componentWillUnmount() {
  }

  private onClickNewProject = () => {
    this.props.onNewProject(this.state.projectName, this.props.history);
    // this.props.history.push(`/project/new`);
  }

  private onClickOpenProject = (project: IProject) => {
    // this.props.onLoadProject(project);
    this.props.history.push(`/project/${project._id}`);
  }

  private onChangeFileName = (event: React.FormEvent<FormControlProps>) => {
    const projectName = (event.target as FormControlProps).value!;
    this.setState({projectName});
  }
  private async getProjectList() {
    this.props.getMyProjects();
      // try {
      //   const projectList = await listMyProjects();
      // } catch (error) {

      // }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChooseProject));
