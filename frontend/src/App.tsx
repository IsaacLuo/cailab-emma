import React, { Component } from 'react';
import './App.css';
import './bootstrap.css';

import { Provider } from 'react-redux';

import PartSelector from './components/PartsSelector';
import styled from 'styled-components';
import PartsDropDown from './components/PartsDropDown';
import Assemble from './components/Assemble';
import axios from 'axios';
import conf from './conf';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import {Button} from 'react-bootstrap';
import ChooseProject from './components/ChooseProject';
import { IUserInfo } from './types';
import { RouteComponentProps } from 'react-router-dom';
import ProjectLoader from './components/ProjectLoader';
import UserBar from './components/UserBar';
import store from './redux/store';
import {detect} from 'detect-browser';
import MainPage from './components/MainPage';
import ProjectWizard from './components/ProjectWizard';

import 'react-notifications/lib/notifications.css';
import { NotificationContainer } from 'react-notifications';
import ManualProtocolView from './components/ManualProtocolView';
import BatchAutoProtocolView from './components/BatchAutoProtocolView';
import GenerateProtocols from './components/GenerateProtocols';
import UploadParts from './components/UploadParts';

import 'antd/dist/antd.css';



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

class App extends Component<any, IState> {
  constructor(props: any) {
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
  }

  public render() {
    const { selectedParts, selectedShortcuts} = this.state;
    const browser = detect();
    if (browser && browser.name !== 'chrome') {
      return (<h1>
        your browser {browser.name} on {browser.os} is not supported right now.
        <a href='https://www.google.com/chrome/'>download chrome here</a>
        </h1>);
    }

    return (
      <Provider store={store}>
      <Router>
      <Route path='/' exact={true} component = {MainPage}/>
      <Route path='/:anything' render={()=>
        <React.Fragment>
          <NotificationContainer/>
          <UserBar/>
          <Route path='/projects' exact={true} component = {ChooseProject}/>
          <Route
            path='/project/:id'
            exact={true}
            component = {ProjectLoader}
          />
          <Route
            path='/project/:id/step2'
            component = {PartsDropDown}
          />

          <Route
            path='/project/:id/step3'
            component = {Assemble}
          />

          <Route
            path='/project/:id/protocols/human/manual'
            component = {ManualProtocolView}
          />

          <Route
            path='/projectWizard'
            component = {ProjectWizard}
          />

          <Route
            path='/generateProtocols'
            component = {GenerateProtocols}
          />

          <Route 
            path='/protocolList/:id'
            component = {BatchAutoProtocolView}
          />

          <Route 
            path='/uploadParts'
            component = {UploadParts}
          />
          

        </React.Fragment>
      }/>
      
      

    </Router>
    </Provider>);
  }

  private onFinishStep1 = (result: any) => {
    const { parts, shortcuts } = result;
    this.setState({ selectedSlots: parts, selectedShortcuts: shortcuts });
  }

  private onFinishStep2 = (result: any) => {
    const parts = result;
    this.setState({ selectedParts: parts });
  }

  private onNewProject = () => {

  }



}

export default App;
