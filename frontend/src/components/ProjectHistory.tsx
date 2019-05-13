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
      {/* <div> */}
        <HistoryLink variant="text">
          {his.updatedAt ? new Date(his.updatedAt).toLocaleString() : 'unknown date'}
        </HistoryLink>
        <CloseButton variant="danger" size="sm" onClick={this.deleteHistory.bind(this, i)}>X</CloseButton>
      {/* </div> */}
      {/* <div>
        {his.parts.map((vv, j)=>
        <svg width="30" height="100">
        {partNames[vv.position].map((vvv, k)=>
            <image
              key={`${j}.${k}`}
              x={0}
              y={k * 20 + 10}
              width='30' height='30' xlinkHref={vvv.icon}
            />)
        }
        </svg>
        )}
      </div> */}
      </HistoryCard>)}
    </div>;
  }

  private deleteHistory(index:number) {
    this.props.deleteHistory(index);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectHistory));
