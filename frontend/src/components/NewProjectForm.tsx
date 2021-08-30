import React from 'react';
import {Button} from 'antd';
import styled from 'styled-components'
import { Row, Col} from 'antd';
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
const OperationHeader = styled.div`
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

const NewProjectForm = () => {
  return <div style={{marginTop: 100}}>
    <Row gutter={40}>
      <Col className="gutter-row" xs={0} md={0} lg={8} />
      <Col className="gutter-row" xs={24} md={24} lg={8}>
        <OperationPanel>
          <OperationHeader>
            Create A New Project
          </OperationHeader>
          <OperationDescription>
            
          </OperationDescription>
          <OperationBottomArea>
            <Link to="/plates">
              <Button type='primary'>start</Button>
            </Link>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
    </Row>
  </div>
}

export default NewProjectForm;