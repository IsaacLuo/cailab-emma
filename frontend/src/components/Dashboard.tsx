import React, { useState, useEffect } from 'react';
import {useDispatch, useMappedState} from 'redux-react-hook';
import { Modal, Input, Progress, Button} from 'antd';
import styled from 'styled-components'
import { Row, Col, Divider } from 'antd';
import { Link } from 'react-router-dom';

const OperationPanel = styled.div`
  background:#0092ff22;
  height: 300px;
  display:flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
  margin:40px;
`
const OpeationHeader = styled.div`
  font-size: 200%;
  margin-bottom: 40px;
`

const OperationDescription = styled.div`
  text-align:left;
  width:100%;
  padding-left: 20px;
  padding-right: 20px;
  flex-grow: 1;
  max-height: 110px;
  overflow-y: hidden;
`

const OperationBottomArea = styled.div`
  margin-bottom:20px;
`

const Dashboard = () => {
  return <div style={{marginTop: 100}}>
    <Row gutter={40}>
      <Col className="gutter-row" xs={0} md={0} lg={3} />
      <Col className="gutter-row" xs={24} md={24} lg={6}>
        <OperationPanel>
          <OpeationHeader>
            Parts
          </OpeationHeader>
          <OperationDescription>
            create some parts, prepare the components for the EMMA assembly
          </OperationDescription>
          <OperationBottomArea>
            <Link to="/partsDecisions">
              <Button type='primary'>start</Button>
            </Link>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
      <Col className="gutter-row" xs={24} md={24} lg={6} >
      <OperationPanel>
          <OpeationHeader>
            Plates
          </OpeationHeader>
          <OperationDescription>
            Design a plate, put your parts in it, and ready for building a protocol for automatic assembly
          </OperationDescription>
          <OperationBottomArea>
            <Button type='primary'>start</Button>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
      <Col className="gutter-row" xs={24} md={24} lg={6} >
        <OperationPanel>
            <OpeationHeader>
              Projects
            </OpeationHeader>
            <OperationDescription>
              Start your building process here.
            </OperationDescription>
            <OperationBottomArea>
              <Button type='primary'>start</Button>
            </OperationBottomArea>
          </OperationPanel>
      </Col>
    </Row>
  </div>
}

export default Dashboard;