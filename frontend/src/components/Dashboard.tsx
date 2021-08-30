import React, { useState } from 'react';
import {Button} from 'antd';
import styled from 'styled-components'
import { Row, Col} from 'antd';
import { Link } from 'react-router-dom';
import { Modal, Form, Input } from 'antd';
import {CREATE_PROJECT} from '../redux/actions';
import {useDispatch} from 'redux-react-hook';
import { useHistory } from "react-router-dom";

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

const Dashboard = () => {

  const [newProjectDlgVisible, setnewProjectDlgVisible] = useState(false);

  const [projectName, setProjectName] = useState('');

  const history = useHistory();

  const dispatch = useDispatch();

  return <div style={{marginTop: 100}}>
    <Row gutter={40}>
      <Col className="gutter-row" xs={0} md={0} lg={3} />
      <Col className="gutter-row" xs={24} md={24} lg={6}>
        <OperationPanel>
          <OperationHeader>
            Parts
          </OperationHeader>
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
          <OperationHeader>
            Design
          </OperationHeader>
          <OperationDescription>
            Create your assembly
          </OperationDescription>
          <OperationBottomArea>
            <Button type='primary' onClick={()=>setnewProjectDlgVisible(true)}>start</Button>
          </OperationBottomArea>
        </OperationPanel>
      </Col>
      <Col className="gutter-row" xs={24} md={24} lg={6} >
        <OperationPanel>
            <OperationHeader>
              Projects
            </OperationHeader>
            <OperationDescription>
              Browse the projects you've created and shared by others
            </OperationDescription>
            <OperationBottomArea>
              <Link to="/projectList">
                <Button type='primary'>start</Button>
              </Link>
            </OperationBottomArea>
          </OperationPanel>
      </Col>
    </Row>
    <Modal
      title="New Project"
      visible={newProjectDlgVisible}
      okButtonProps={{disabled:projectName === ''}}
      onOk={async ()=>{
        dispatch({type: CREATE_PROJECT, data:{name:projectName, history}});
        setnewProjectDlgVisible(false);
      }}
      onCancel={()=>setnewProjectDlgVisible(false)}
    >
      <Form>
        <Form.Item
          label="Project Name"
          name="projectName"
        >
        <Input value={projectName} onChange={(event)=>setProjectName(event.target.value)}/>
      </Form.Item>
    </Form>
    </Modal>
  </div>
}

export default Dashboard;