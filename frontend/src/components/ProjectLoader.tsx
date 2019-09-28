import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import PartSelector from './PartsSelector';

interface IProps extends RouteComponentProps {
}
interface IState {
}

class ProjectLodader extends React.Component<IProps, IState> {
  public render() {
    return (
      <PartSelector/>
    );
  }
}

export default withRouter(ProjectLodader);
