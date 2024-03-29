import * as React from 'react';

import { RouteComponentProps, withRouter} from 'react-router-dom';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';
import {
  LOAD_HISTORY,
  DELETE_HISTORY,
  RESET_HISTORY_0,
} from '../redux/actions';
import styled from 'styled-components';
import { IStoreState, IProject } from '../types';
import partNames from '../partNames';
import { Button } from 'react-bootstrap';

const HistoryCard = styled.div`
  &:hover {
    background: #eef;
  }
`;

const HistoryLink = styled(Button)`

`;

const HistoryTitle = styled('span')`
margin-right:20px;
`;

const CloseButton = styled(Button)`
  margin-left:5px;
`;

interface IProps extends RouteComponentProps {
  project: IProject;
  stashHistory?: IProject;
  loadHistory: (index:number)=>void;
  deleteHistory: (projectId:string, historyIndex:number, historyTimeStamp:Date)=>void;
  resetProject:()=>void,
}
interface IState {
}
const mapStateToProps = (state: IStoreState) => ({
  project: state.app.currentProject,
  stashHistory: state.app.stashHistory,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadHistory: (index:number)=>dispatch({type:LOAD_HISTORY, data:index}),
  deleteHistory: (projectId:string, historyIndex:number, historyTimeStamp:Date)=>dispatch({type:DELETE_HISTORY, data:{projectId, historyIndex, historyTimeStamp}}),
  resetProject: ()=>dispatch({type:RESET_HISTORY_0}),
});

class ProjectHistory extends React.Component<IProps, IState> {

  public shouldComponentUpdate(np: IProps, ns: IState) {
    return true;
  }

  public render() {
    const history = this.props.project.history;
    const stashHistory = this.props.stashHistory || this.props.project;
    const projectHistoryIconSize = 30;
    return <div>
      <h3>Project History</h3>
      <HistoryCard>
        <HistoryLink variant="text" onClick={this.resetProject}>
          <HistoryTitle>{stashHistory.updatedAt?new Date(stashHistory.updatedAt).toLocaleString(): 'latest'}</HistoryTitle>
        {stashHistory.parts.filter(vv=>vv.selected).map((vv, j)=>
        <svg width={projectHistoryIconSize} height={projectHistoryIconSize+10} key={j}>
        {partNames[vv.position].filter((vvv,k)=>k<1).map((vvv, k)=>
            <image
              key={`${j}.${k}`}
              x={0}
              y={k * projectHistoryIconSize + 5}
              width={projectHistoryIconSize} height={projectHistoryIconSize} xlinkHref={vvv.icon}
            />)
        }
        </svg>
        )}
        </HistoryLink>
      </HistoryCard>
      {history && history.map((his:IProject, i:number)=>
      <HistoryCard key={i}>
        <HistoryLink variant="text" onClick={this.onClickLoadProjectHistory.bind(this,i)}>
        <HistoryTitle>{his.updatedAt ? new Date(his.updatedAt).toLocaleString() : 'unknown date'}</HistoryTitle>
        
        {his.parts.map((vv, j)=>
        <svg width={projectHistoryIconSize} height={projectHistoryIconSize+10} key={j}>
        {partNames[vv.position].filter((vvv,k)=>k<1).map((vvv, k)=>
            <image
              key={`${j}.${k}`}
              x={0}
              y={k * projectHistoryIconSize + 5}
              width={projectHistoryIconSize} height={projectHistoryIconSize} xlinkHref={vvv.icon}
            />)
        }
        </svg>
        )}
        </HistoryLink>
        <CloseButton variant="text" size="sm" onClick={this.deleteHistory.bind(this, i, his.updatedAt)}>X</CloseButton>
      </HistoryCard>)}
    </div>;
  }

  private onClickLoadProjectHistory(index:number) {
    this.props.loadHistory(index);
  }

  private resetProject = ()=> {
    this.props.resetProject();
  }

  private deleteHistory(index:number, timeStamp?: Date) {
    if(this.props.project._id && timeStamp) {
      this.props.deleteHistory(this.props.project._id, index, timeStamp);
    } else {
      console.warn('unable to delete hisotry', this.props.project._id, timeStamp)
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectHistory));
