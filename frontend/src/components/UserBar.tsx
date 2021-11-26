import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Link, Redirect } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {
  SHOW_LOGIN_WINDOW,
  LOGOUT,
  GET_CURRENT_USER,
  CAILAB_INSTANCE_LOGIN,
} from '../redux/actions';
import { Menu } from 'antd';

const GUEST_ID = '000000000000000000000000';

const UserBar = styled.div`
  background-color: #e9ecef;
`;

const PortraitImg = styled.img`
  margin:0px;
  margin-right:0px;
  border-radius: 50px;
`;

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  showLoginWindow: () => void;
  getCurrentUser: () => void;
  logout: () => void;
  cailabInstanceLogin: ()=>void;
}
interface IState {
  projectList: IProject[];
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showLoginWindow: () => dispatch({type: SHOW_LOGIN_WINDOW}),
  cailabInstanceLogin: ()=>dispatch({type:CAILAB_INSTANCE_LOGIN}),
  getCurrentUser: () => dispatch({type: GET_CURRENT_USER}),
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
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['']}
          style={{ lineHeight: '66px' }}
        >
          <Menu.Item key="1"><Link to="/">cailab-emma</Link></Menu.Item>
          <Menu.Item key="2" onClick={this.onClickLogin}>
            login
          </Menu.Item>
        </Menu>
        
        :
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{ lineHeight: '66px' }}
        >
          <Menu.Item key="1"><Link to="/">cailab-emma</Link></Menu.Item>
          <Menu.SubMenu style={{float: 'right'}} title={<span>{currentUser.fullName}<PortraitImg src='https://api.auth.cailab.org/api/user/current/portrait/s/profile.jpg'/></span>}>
            <Menu.Item key="2" onClick={this.onClickLogout}>logout</Menu.Item>
            
          </Menu.SubMenu>
      </Menu>
          
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
    const height = 600;
    const top = (window.screen.availHeight / 2) - (height / 2);
    const left = (window.screen.availWidth / 2) - (width / 2);

    window.addEventListener('message', this.onLogginWindowClosed, false);
    window.open(
      'https://auth.cailab.org/login',
      'cailablogin',
// tslint:disable-next-line: max-line-length
      `toolbar=no,location=no,status=no,menubar=no,scrollbar=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`,
    );
  }

  private onLogginWindowClosed = (messageEvent: MessageEvent) => {
    const {data} = messageEvent;
    if (data.event === 'closed' && data.success === true) {
      console.log('login');
      this.props.cailabInstanceLogin();
    }
    window.removeEventListener('message', this.onLogginWindowClosed);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MyComponent));
