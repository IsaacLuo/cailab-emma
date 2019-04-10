import * as React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo } from '../types';
import {Button} from 'react-bootstrap';
import uuid from 'uuid/v1';
import { listMyProjects } from '../backendCalls';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  onNewProject?: () => void;
}
interface IState {

}

class ChooseProject extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public componentWillMount() {
    this.listMyProjects();
  }

  public componentWillReceiveProps(np: IProps) {
    console.log(np);
    // if (np.currentUser !== this.props.currentUser) {
      // this.listMyProjects();
    // }
  }
  public componentWillUpdate() {
    this.listMyProjects();
  }

  public render() {
    return (
      <div>
        <Button variant='primary' onClick={this.onClickNewProject}>new project</Button>
      </div>
    );
  }

  private onClickNewProject = () => {
    this.props.history.push(`/project/${uuid()}`);
    if (this.props.onNewProject) {
      this.props.onNewProject();
    }
  }

  private async listMyProjects() {
    console.log('list project', this.props, this.props.currentUser);
    if (this.props.currentUser._id) {
      try {
        const projectList = await listMyProjects();
      } catch (error) {

      }
    }
  }
}

export default withRouter(ChooseProject);
