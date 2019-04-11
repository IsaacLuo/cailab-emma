import * as React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect } from 'react-router-dom';
import { IUserInfo } from '../types';
import {Button} from 'react-bootstrap';
import uuid from 'uuid/v1';
import Axios from 'axios';
import conf from '../conf';
import { getProjectById } from '../backendCalls';
import PartSelector from './PartsSelector';

const Panel = styled.div`
  margin:100px;
  text-align:left;
`;

interface IProps extends RouteComponentProps {
}
interface IState {
}

class ProjectLodader extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    return (
      <PartSelector/>
    );
  }
}

export default withRouter(ProjectLodader);
