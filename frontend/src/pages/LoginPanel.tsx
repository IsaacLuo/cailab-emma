import * as React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo } from '../types';
import {Button} from 'react-bootstrap';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
}
interface IState {

}

class LoginPanel extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    if (this.props.currentUser._id === '') {
      return <Panel>
        <Button variant='primary'>Primary</Button>
      </Panel>;
    } else {
      return <Redirect to={'/projects'}/>;
    }
  }
}

export default withRouter(LoginPanel);
