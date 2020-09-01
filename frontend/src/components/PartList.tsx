/**
 * PartList
 */
import * as React from 'react';
import styled from 'styled-components';
import PartTabs from './PartTabs';
import { Breadcrumb } from 'react-bootstrap';


const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const PartList = () => {
  return (
    <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item href='/dashboard'>Home</Breadcrumb.Item>
        <Breadcrumb.Item href='/partsDecisions'>parts</Breadcrumb.Item>
        <Breadcrumb.Item active>part list</Breadcrumb.Item>
      </Breadcrumb>
      <Panel>
        <div style={{marginTop:30}}>
          <h3>Parts</h3>
          <PartTabs/>
        </div>
      </Panel>
    </React.Fragment>
  );
}

export default PartList;
