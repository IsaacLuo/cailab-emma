import React, { Component } from 'react';
import './App.css';
import './bootstrap.css';

import PartSelector from './components/PartsSelector';
import styled from 'styled-components';
import PartsDropDown from './components/PartsDropDown';
import Assemble from './components/Assemble';
import axios from 'axios';
import conf from './conf';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import {Button} from 'react-bootstrap';
import LoginPanel from './pages/LoginPanel';
import ChooseProject from './components/ChooseProject';
import { IUserInfo } from './types';
import { RouteComponentProps } from 'react-router-dom';
import ProjectLoader from './components/ProjectLoader';

const CenterDiv = styled.div`
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

interface IState {
  currentUser: IUserInfo;
  selectedSlots: any[];
  selectedParts: any[];
  selectedShortcuts: any[];
}

class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentUser: {
          _id: '',
          fullName: 'guest',
          groups: ['guest'],
        },
      selectedSlots: [],
      selectedParts: [],
      selectedShortcuts: [],
    };

    // try to login automatically using cookie
    this.verifyIdentity();
  }

  public render() {
    const { selectedParts, selectedShortcuts} = this.state;

    return <Router>
      {
        this.state.currentUser._id === ''
        ?
        <Button variant='primary' onClick={this.clickLogin}>login</Button>
        :
        <p>user: {this.state.currentUser.fullName}</p>
      }

      <Route path='/' exact={true} render={(props: any) =>
        <ChooseProject
          {...props}
          currentUser={this.state.currentUser}
        />}
      />

      <Route
        path='/project/:uuid'
        render={(props: RouteComponentProps) =>
            <ProjectLoader
              {...props}
              currentUser={this.state.currentUser}
              projectId={(props.match.params as any).uuid}
            />
          }
      />

    </Router>;

    // if (selectedParts.length > 0) {
    //   return (
    //     <div className='App'>
    //       <Assemble
    //         selectedParts={selectedParts}
    //         selectedShortcuts={selectedShortcuts}
    //       />
    //       {selectedParts.map((v: any, i: number) => <div key={i}>
    //         {v.selected.name}
    //       </div>)}
    //     </div>
    //   );
    // }
    // return (
    //   <div className='App'>
    //     <CenterDiv>
    //       {<button onClick={this.clickLogin}>log in</button>}
    //       {
    //         this.state.selectedSlots.length > 0
    //           ?
    //           <PartsDropDown
    //             parts={this.state.selectedSlots}
    //             onClickNext={this.onFinishStep2}
    //           />
    //           :
    //           <PartSelector
    //             onClickNext={this.onFinishStep1}
    //           />
    //       }
    //     </CenterDiv>
    //   </div>
    // );
  }

  private onFinishStep1 = (result: any) => {
    const { parts, shortcuts } = result;
    this.setState({ selectedSlots: parts, selectedShortcuts: shortcuts });
  }

  private onFinishStep2 = (result: any) => {
    const parts = result;
    this.setState({ selectedParts: parts });
  }

  private clickLogin = (event: any) => {
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
      this.verifyIdentity();
    }
    window.removeEventListener('message', this.onLogginWindowClosed);
  }

  private async verifyIdentity() {
    try {
      const serverRes = await axios.get(conf.serverURL + '/api/user/current', {withCredentials: true});
      const currentUser = serverRes.data.user;
      this.setState({currentUser});
    } catch (error) {
      this.setState({
        currentUser: {
          _id: '',
          fullName: 'guest',
          groups: ['guest'],
        }});
    }
  }
}

export default App;
