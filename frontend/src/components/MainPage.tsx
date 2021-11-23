import * as React from 'react'
import {Button} from 'react-bootstrap';
import styled from 'styled-components';

import { withRouter, RouteComponentProps, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IUserInfo} from '../types.js';
import { Dispatch } from 'redux';
import { CAILAB_INSTANCE_LOGIN, GET_CURRENT_USER } from '../redux/actions';

const Panel = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  height:600px;
`;

const RectDialog = styled.div`
  width:400px;
  height:400px;
  border:solid 1px black;
  display:flex;
  flex-direction:column;
  align-items: center;
  justify-content: space-around;
`;

const Title = styled.h1`
  flex:2;
  display:flex;
  align-items: center;
  justify-content: center;
`;

const BottomArea = styled.div`
  display:flex;
  flex-direction:column;
  align-items: center;
  justify-content: space-around;
  flex:1;
`;

interface IProps extends RouteComponentProps {
  currentUser:IUserInfo,
  cailabInstanceLogin:()=>void,
  getCurrentUser:()=>void,
}
interface IState {
  showRefresh:boolean
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cailabInstanceLogin: () => dispatch({type: CAILAB_INSTANCE_LOGIN}),
  getCurrentUser: ()=>dispatch({type:GET_CURRENT_USER}),
});

class MainPage extends React.Component<IProps, IState> {
  constructor (props:IProps) {
    super(props);
    props.getCurrentUser();
    this.state = {showRefresh:false}
  }

  public render() {
    if(this.props.currentUser._id !== '') {
      console.log('logged in, redirect');
      return <Redirect to='/dashboard'/>
    } else {
      return <Panel>
        <RectDialog>
          <Title>CAILAB-EMMA</Title>
          <BottomArea>
          <Button variant='primary' onClick={this.onClickLogin}>Login to Cailab</Button>
            {this.state.showRefresh && <a href="/">If no response after login, click here to refresh</a>}
          </BottomArea>
        </RectDialog>
      </Panel>
    }
  }

  private onClickLogin = () => {
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
    this.setState({ showRefresh: true });
  }
  private onClickLoginGuest = () => {
    const width = 400;
    const height = 560;
    const top = (window.screen.availHeight / 2) - (height / 2);
    const left = (window.screen.availWidth / 2) - (width / 2);

    window.addEventListener('message', this.onLogginWindowClosed, false);
    window.open(
      'https://auth.cailab.org/guestLogin',
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainPage));