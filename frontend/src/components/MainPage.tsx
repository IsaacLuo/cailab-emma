import * as React from 'react'
import {Dropdown, Button, Table, Breadcrumb} from 'react-bootstrap';
import styled from 'styled-components';

import CONNECTORS from '../connectors.json'
import {IFeature, DNASeq} from '../gbGenerator';
import vectorReceiver from '../vectorReceiver.json';
import { withRouter, RouteComponentProps, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IUserInfo} from '../types.js';
import { Dispatch } from 'redux';
import { GET_PROJECT, GET_CURENT_USER } from '../redux/actions';

const Panel = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  height:600px;
`;

const RectDiaglog = styled.div`
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

const ButtomArea = styled.div`
  display:flex;
  flex-direction:column;
  align-items: center;
  justify-content: space-around;
  flex:1;
`;

interface IProps extends RouteComponentProps {
  currentUser:IUserInfo,
  getCurrentUser:()=>void,
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getCurrentUser: () => dispatch({type: GET_CURENT_USER}),
});

class MainPage extends React.Component<IProps, IState> {
  constructor (props:IProps) {
    super(props);
    props.getCurrentUser();
  }

  public render() {
    if(this.props.currentUser._id !== '') {
      console.log('logged in, redirect');
      return <Redirect to='/projects'/>
    } else {
      return <Panel>
        <RectDiaglog>
          <Title>CAILAB-EMMA</Title>
          <ButtomArea>
          <Button variant='primary' onClick={this.onClickLogin}>Login to Cailab</Button>
          or
          <Button variant='link' onClick={this.onClickLoginGuest}>Try as guest</Button>
          </ButtomArea>
        </RectDiaglog>
      </Panel>
    }
  }

  private onClickLogin = () => {
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
  private onClickLoginGuest = () => {
    const width = 400;
    const height = 560;
    const top = (screen.availHeight / 2) - (height / 2);
    const left = (screen.availWidth / 2) - (width / 2);

    window.addEventListener('message', this.onLogginWindowClosed, false);
    const subWindow = window.open(
      'https://auth.cailab.org/guestLogin',
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MainPage));