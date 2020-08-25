/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';
import { IUserInfo, IStoreState } from '../../types';
import { 
  GET_PARTS,
} from './actions';
import { Table, Tabs, Button, Modal } from 'antd';
import { BarsOutlined } from '@ant-design/icons';

interface IProps {
  currentUser: IUserInfo;
  offset:number;
  first:number;
  count:number;
  parts: any;
  posFilter?: string;
  categoryFilter?: string;

  dispatchGetParts: (offset:number, first:number,posFilter?:string, categoryFilter?:string) => void;
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
  posFilter: state.partsTable.posFilter,
  categoryFilter: state.partsTable.categoryFilter,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatchGetParts: (offset:number, first:number, posFilter?:string, categoryFilter?:string) => dispatch({type:GET_PARTS, data:{offset, first, posFilter, categoryFilter}}),
});

class PartsTable extends React.Component<IProps, IState> {

  public static getDerivedStateFromProps(props: IProps, state: IState) {
    return {parts: props.parts.map((v:any)=>({...v.part, _id:v._id}))};
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      parts: [],
    }
  }

  public componentWillReceiveProps(np:IProps) {
    this.props.dispatchGetParts(this.props.offset, this.props.first, this.props.posFilter, this.props.categoryFilter);
  }

  public componentDidMount() {
    this.props.dispatchGetParts(this.props.offset, this.props.first, this.props.posFilter, this.props.categoryFilter);
  }

  public componentWillUpdate() {
    
  }

  public render() {
    const { Column } = Table;
    const {count, first, offset} = this.props;
    const pager = {total: count, pageSize: first, current: Math.floor(offset/first)+1}

    return (
      <React.Fragment>
      <Table 
        dataSource={this.state.parts} 
        pagination={pager} 
        onChange={this.onChangeTable}
        rowKey={(record:any) => record._id}
      >
        <Column title="Pos" dataIndex="position" key="position"/>
        <Column title="Name" dataIndex="name" key="name"/>
        <Column title="labName" dataIndex="labName" key="labName"/>
        <Column title="category" dataIndex="category" key="category"/>
        <Column title="comment" dataIndex="comment" key="comment"/>
        <Column
          title="Action"
          key="action"
          render={(text, record:any) => (
            <span>
              <Button type="link"
                onClick={()=>{
                  Modal.info({
                    title: `sequence of ${record.name}`,
                    width: 800,
                    content: (
                      <div>
                        <p>{record.sequence}</p>
                      </div>
                    ),
                    onOk() {},
                  });
                }}
              >
              <BarsOutlined />sequence
              </Button>
            </span>
          )}
        />
      </Table>
      </React.Fragment>
    );
  }

  private onChangeTable = (pagination:any, filters:any, sorter:any) => {
    this.props.dispatchGetParts((pagination.current-1)*this.props.first, this.props.first);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PartsTable as any);
