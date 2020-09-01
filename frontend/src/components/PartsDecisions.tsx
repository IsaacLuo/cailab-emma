import React from 'react';
import {Button} from 'antd';
import styled from 'styled-components'
import { Row, Col} from 'antd';
import { Link } from 'react-router-dom';
import {Breadcrumb} from 'react-bootstrap';

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

const PartsDecisions = () => {
  return <React.Fragment>
  <Breadcrumb>
    <Breadcrumb.Item href='/dashboard'>Home</Breadcrumb.Item>
    <Breadcrumb.Item active>parts</Breadcrumb.Item>
  </Breadcrumb>
  <div style={{marginTop: 100}}>
    <Row gutter={40}>
      <Col className="gutter-row" xs={0} md={0} lg={4} />
      <Col className="gutter-row" xs={24} md={24} lg={8}>
        <OperationPanel>
          <OpeationHeader>
            Browse Parts
          </OpeationHeader>
          <OperationDescription>
            to see what parts we have currently
          </OperationDescription>
          <OperationBottomArea>
            <Link to="/parts">
              <Button type='primary'>start</Button>
            </Link>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
      <Col className="gutter-row" xs={24} md={24} lg={8} >
      <OperationPanel>
          <OpeationHeader>
            Create A Part
          </OpeationHeader>
          <OperationDescription>
            Create a part by filling a form
          </OperationDescription>
          <OperationBottomArea>
            <Link to="/uploadParts">
              <Button type='primary'>start</Button>
            </Link>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
    </Row>
    <Row gutter={40}>
      <Col className="gutter-row" xs={0} md={0} lg={4} />
      <Col className="gutter-row" xs={24} md={24} lg={8}>
        <OperationPanel>
          <OpeationHeader>
            Browse Plates
          </OpeationHeader>
          <OperationDescription>
            To see plates in the database
          </OperationDescription>
          <OperationBottomArea>
            <Link to="/plates">
              <Button type='primary'>start</Button>
            </Link>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
      <Col className="gutter-row" xs={24} md={24} lg={8} >
      <OperationPanel>
          <OpeationHeader>
            Define a new plate
          </OpeationHeader>
          <OperationDescription>
            create a plate for automatic assembly
          </OperationDescription>
          <OperationBottomArea>
            <Link to="/plate/new">
              <Button type='primary'>start</Button>
            </Link>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
    </Row>
  </div>
  </React.Fragment>
}

export default PartsDecisions;