import * as React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo } from '../types';
import {Button} from 'react-bootstrap';
import uuid from 'uuid/v1';

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
}

export default withRouter(ChooseProject);
