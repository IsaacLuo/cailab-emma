/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
// import { Dispatch } from 'redux';
// import {connect} from 'react-redux';

import styled from 'styled-components';
// import { RouteComponentProps, withRouter} from 'react-router-dom';
// import { IStoreState } from '../types';

//my components

import PartsTable from './PartsTable';
import PartTabs from './PartTabs';


const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const PartList = () => {
  return (
    <Panel>
      <div style={{marginTop:30}}>
        <h3>Parts</h3>
        <PartTabs/>
      </div>
    </Panel>
  );
}

export default PartList;
