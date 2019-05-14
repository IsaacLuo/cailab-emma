import * as React from 'react';

import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';
import {
  DELETE_HISTORY
} from '../redux/actions';
import styled from 'styled-components';
import { IStoreState, IProject } from '../types';
import partNames from '../partNames';
import { Button } from 'react-bootstrap';

const HistoryCard = styled.div`
  
`;

const HistoryLink = styled(Button)`
`;

const CloseButton = styled(Button)`
  margin-left:5px;
`;

interface IProps extends RouteComponentProps {
  project: IProject;
  deleteHistory: (index:number)=>void;
}
interface IState {
}
const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  deleteHistory: (index:number)=>dispatch({type:DELETE_HISTORY, data:index}),
});

class ProjectHistory extends React.Component<IProps, IState> {
  // public static getDerivedStateFromProps(props: IProps, state: IState): IState|null {
  //   return null;
  // }
  constructor(props: IProps) {
    super(props);
  }

  public shouldComponentUpdate(np: IProps, ns: IState) {
    return true;
  }

  public render() {
    const history = this.props.project.history;
    return <div>
      <h3>Project History</h3>
      {history && history.map((his:IProject, i:number)=>
      <HistoryCard key={i}>
        <HistoryLink variant="text" onClick={this.onClickLoadProjectHistory.bind(this,i)}>
          {his.updatedAt ? new Date(his.updatedAt).toLocaleString() : 'unknown date'}
        
        {his.parts.map((vv, j)=>
        <svg width="15" height="50" key={j}>
        {partNames[vv.position].map((vvv, k)=>
            <image
              key={`${j}.${k}`}
              x={0}
              y={k * 20 + 10}
              width='15' height='15' xlinkHref={vvv.icon}
            />)
        }
        </svg>
        )}
        </HistoryLink>
        <CloseButton variant="danger" size="sm" onClick={this.deleteHistory.bind(this, i)}>X</CloseButton>
      </HistoryCard>)}
    </div>;
  }

  private onClickLoadProjectHistory(index:number) {
    console.log(index);
  }

  private deleteHistory(index:number) {
    this.props.deleteHistory(index);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectHistory));
