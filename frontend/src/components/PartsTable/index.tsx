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
import { Form, Icon, Input, Button, Pagination } from 'antd';

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
  count:number;
  parts: any;

  dispatchGetParts: (offset:number, first:number) => void;
}
interface IState {
  parts: any;
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  parts: state.partsTable.parts,
  offset: state.partsTable.offset,
  first: state.partsTable.first,
  count: state.partsTable.count,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchGetParts: (offset:number, first:number, ) => dispatch({type:GET_PARTS, data:{offset, first}}),
});

class PartsTable extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps(props: IProps, state: IState) {
    console.log('props', props.parts);
    return {parts: props.parts.map((v:any)=>({...v.part, _id:v._id}))};
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      parts: [],
    }
  }

  public componentDidMount() {
    this.props.dispatchGetParts(this.props.offset, this.props.first);
  }

  public render() {

    const { Column, ColumnGroup } = Table;
    const {count, first, offset} = this.props;
    const pager = {total: count, pageSize: first, current: Math.floor(offset/first)+1}

    return (
      <React.Fragment>
      <Table 
        dataSource={this.props.parts} 
        pagination={pager} 
        onChange={this.onChangeTable}
        rowKey={(record:any) => record._id}
      >
        <Column title="Pos" dataIndex="part.position" key="part.position"/>
        <Column title="Name" dataIndex="part.name" key="part.name"/>
        <Column title="labName" dataIndex="part.labName" key="part.labName"/>
        <Column title="category" dataIndex="part.category" key="part.category"/>
        <Column title="comment" dataIndex="part.comment" key="part.comment"/>
        <Column
          title="Action"
          key="action"
          render={(text, record) => (
            <span>
            </span>
          )}
        />
      </Table>
      </React.Fragment>
    );
  }

  private onChangeTable = (pagination:any, filters:any, sorter:any) => {
    console.log(pagination);
    this.props.dispatchGetParts((pagination.current-1)*this.props.first, this.props.first);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PartsTable);
