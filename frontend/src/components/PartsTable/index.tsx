/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../../types';
import { 
  GET_PARTS,
} from './actions';
import { Table, Divider, Tag } from 'antd';
import { Form, Icon, Input, Button } from 'antd';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const CloseButton = styled(Button)`
  margin-left:10px;
`;


const EditButton = styled.img`
  width:15px;
  height:15px;
  margin-left:5px;
  cursor:pointer;
`

interface IProps {
  currentUser: IUserInfo;
  offset:number;
  first:number;

  dispatchGetParts: (offset:number, first:number) => void;
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  offset: state.partsTable.offset,
  first: state.partsTable.first,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchGetParts: (offset:number, first:number, ) => dispatch({type:GET_PARTS, data:{offset, first}}),
});

class PartsTable extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      editingProjectName: '',
    };
  }

  public componentDidMount() {
    this.props.dispatchGetParts(this.props.offset, this.props.first);
  }

  public render() {

    const { Column, ColumnGroup } = Table;

const data = [
  {
    key: '1',
    firstName: 'John',
    lastName: 'Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    firstName: 'Jim',
    lastName: 'Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    firstName: 'Joe',
    lastName: 'Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

    return (
      <Table dataSource={data}>
            <ColumnGroup title="Name">
              <Column title="First Name" dataIndex="firstName" key="firstName" />
              <Column title="Last Name" dataIndex="lastName" key="lastName" />
            </ColumnGroup>
            <Column title="Age" dataIndex="age" key="age" />
            <Column title="Address" dataIndex="address" key="address" />
            <Column
              title="Tags"
              dataIndex="tags"
              key="tags"
              render={tags => (
                <span>
                  {tags.map((tag:any) => (
                    <Tag color="blue" key={tag}>
                      {tag}
                    </Tag>
                  ))}
                </span>
              )}
            />
            <Column
              title="Action"
              key="action"
              render={(text, record) => (
                <span>
                  <a href="javascript:;">Delete</a>
                </span>
              )}
            />
          </Table>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PartsTable);