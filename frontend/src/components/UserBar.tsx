import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {Button} from 'react-bootstrap';
import uuid from 'uuid/v1';
import { listMyProjects } from '../backendCalls';
import {
  SHOW_LOGIN_WINDOW,
  LOGOUT,
  GET_CURENT_USER,
} from '../redux/actions';

const GUEST_ID = '4e7020cb7cac81af7136236b';

const UserBar = styled.div`
  background-color: #e9ecef;
`;

const PortraitImg = styled.img`
  margin:5px;
  margin-right:15px;
  border-radius: 50px;
  border: solid 1px #77f;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  showLoginWindow: () => void;
  getCurrentUser: () => void;
  logout: () => void;
}
interface IState {
  projectList: IProject[];
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showLoginWindow: () => dispatch({type: SHOW_LOGIN_WINDOW}),
  getCurrentUser: () => dispatch({type: GET_CURENT_USER}),
  logout: () => dispatch({type: LOGOUT}),
});

class MyComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    props.getCurrentUser();
  }
  public render() {
    const {currentUser} = this.props;
    if(currentUser._id==='') {
      return <Redirect to='/'/>
    }
    return (
      <UserBar>
        {
          currentUser._id === '' || currentUser._id === GUEST_ID
        ?
        <Button variant='primary' onClick={this.onClickLogin}>login</Button>
        :
        <div>
          <PortraitImg src='https://api.auth.cailab.org/api/user/current/portrait/s/profile.jpg'/>
          {currentUser.fullName}
          <Button variant='link' onClick={this.onClickLogout}>logout</Button>
        </div>
      }
      </UserBar>
    );
  }
  private onClickLogout = (evnet: any) => {
    this.props.logout();
    // this.props.history.push('/');
  }

  private onClickLogin = (event: any) => {
    const width = 400;
    const height = 560;
    const top = (screen.availHeight / 2) - (height / 2);
    const left = (screen.availWidth / 2) - (width / 2);

    window.addEventListener('message', this.onLogginWindowClosed, false);
    const subWindow = window.open(
      'https://auth.cailab.org/login',
      'cailablogin',
// tslint:disable-next-line: max-line-length
      `toolbar=no,location=no,status=no,menubar=no,scrollbar=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`,
    );
  }

  private onLogginWindowClosed = (messageEvent: MessageEvent) => {
    const {origin, data} = messageEvent;
    if (data.event === 'closed' && data.success === true) {
      console.log('login');
      this.props.getCurrentUser();
    }
    window.removeEventListener('message', this.onLogginWindowClosed);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyComponent));
