/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect, useDispatch} from 'react-redux';
import { IUserInfo, IStoreState } from '../../types';
import { 
  GET_PARTS,
  SET_ACTIVE_POSITION,
  SET_ACTIVE_CATEGORY,
} from '../PartsTable/actions';
import { Table, Tabs} from 'antd';

import tabs from '../../tabs.json';
import PartsTable from '../PartsTable';
import styled from 'styled-components';
import { useMappedState } from 'redux-react-hook';
import PART_NAMES from '../../partNames';

const Panel = styled.div`
display:flex;
flex-wrap:nowrap;
flex-direction:row;
`

const MessageHeader = styled.div`
font-size:20px;
`

const POSITIONS = ['1', '2', '3', '4', '5', '6', '7', '8a', '8b', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24','25'];
const CATEGORIES:any = tabs;

const PartTabs = () => {

  const dispatch = useDispatch();
  const partsTableState = useMappedState((state:IStoreState)=>state.partsTable);

  return (
    <React.Fragment>
    <div>
      <MessageHeader>Select a position and category</MessageHeader>
    <Tabs defaultActiveKey="1" onChange={(e)=>dispatch({type:SET_ACTIVE_POSITION, data:e})}
    >
      {POSITIONS.map((posName:string, i:number) => (
        <Tabs.TabPane tab={
        <div>
          <div><img src={PART_NAMES[i][0].icon} width={20} height={20}/></div>
          <div style={{textAlign:'center'}}>{posName}</div>
        </div>
        } key={posName}>
        </Tabs.TabPane>
      ))}
    </Tabs>
    <Panel>
      <div>
        <Tabs tabPosition="left" defaultActiveKey="All" onChange={(e)=>dispatch({type:SET_ACTIVE_CATEGORY, data:e})}
        >
          {
            partsTableState.posFilter && 
          (
            CATEGORIES[partsTableState.posFilter].length === 1? CATEGORIES[partsTableState.posFilter] : ['All', ...CATEGORIES[partsTableState.posFilter]]
          ).map((cate:any, i:number) => (
            <Tabs.TabPane tab={`${cate}`} key={cate}>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
      <div style={{flexGrow:1}}>
        <PartsTable/>
      </div>
    </Panel>
  </div>
  </React.Fragment>
  )
}

export default PartTabs;
