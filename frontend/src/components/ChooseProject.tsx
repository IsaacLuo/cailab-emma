import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {Button} from 'react-bootstrap';
import { listMyProjects } from '../backendCalls';
import { SET_CURRENT_PROJECT } from '../redux/actions';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  projects: IProject[];
  onNewProject: () => void;
  onLoadProject: (project: IProject) => void;
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  projects: state.app.myProjects,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onNewProject: () => dispatch({type: SET_CURRENT_PROJECT, data: {
    name: `newProject ${new Date().toLocaleString()}`,
    parts: (new Array(26).map((v) => ({activated: false, selected: false}))),
    history: [],
  }}),
  onLoadProject: (project: IProject) => dispatch({type: SET_CURRENT_PROJECT, data: project}),
});

class ChooseProject extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      projectList: [],
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
        <Button variant='primary' onClick={this.onClickNewProject}>new project</Button>
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
    console.debug('component ChooseProject unmount');
    this.setState({
      projectList: [],
    });
  }

  private onClickNewProject = () => {
    this.props.onNewProject();
    this.props.history.push(`/project/new`);
  }

  private onClickOpenProject = (project: IProject) => {
    // this.props.onLoadProject(project);
    this.props.history.push(`/project/${project._id}`);
  }

  private async getProjectList() {
      try {
        const projectList = await listMyProjects();
        this.setState({projectList});
      } catch (error) {

      }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChooseProject));
