/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import { IUserInfo,IStoreState } from '../../types';
import { 
  GET_PLATES,
} from './actions';
import { Table} from 'antd';
import { wellIdToWellName } from '../../utilities/wellIdConverter';

interface IProps {
  currentUser: IUserInfo;
  offset:number;
  first:number;
  count:number;
  plates: any;

  dispatchGetParts: (offset:number, first:number) => void;
}
interface IState {
}

const mapStateToProps = (state: IStoreState) => ({
  plates: state.platesTable.plates,
  offset: state.platesTable.offset,
  first: state.platesTable.first,
  count: state.platesTable.count,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchGetParts: (offset:number, first:number, ) => dispatch({type:GET_PLATES, data:{offset, first}}),
});

class PartsTable extends React.Component<IProps, IState> {

  // public static getDerivedStateFromProps(props: IProps, state: IState) {
  //   console.log('props', props.parts);
  //   return {parts: props.parts.map((v:any)=>({...v.part, _id:v._id}))};
  // }

  constructor(props: IProps) {
    super(props);
    this.state = {
      plates: [],
    }
  }

  public componentDidMount() {
    this.props.dispatchGetParts(this.props.offset, this.props.first);
  }

  public render() {

    const { Column } = Table;
    const {count, first, offset} = this.props;
    const pager = {total: count, pageSize: first, current: Math.floor(offset/first)+1}

    return (
      <React.Fragment>
      <Table
        dataSource={this.props.plates} 
        pagination={pager} 
        onChange={this.onChangeTable}
        rowKey={(record:any) => record._id}
        expandedRowRender={record => 
        <div style={{ margin: 0 }}>{
          record.content.map((v:any, i:number)=>
            v &&
            v.part ?
            <div key={i}>{wellIdToWellName(i)} {`${v.part.part.name}(${v.part.part.labName})`}</div>
            :
            <div key={i}>{wellIdToWellName(i)} {`${v.connector.name}`}</div>

          ).filter((v:any)=>v)}
        </div>}
      >
        <Column title="Name" dataIndex="name" key="name"/>
        <Column title="comment" dataIndex="description" key="description"/>
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
