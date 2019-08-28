/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Redirect, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState, IPartDetail, IPartName } from '../types';
import PartSelectSearchBox from './PartSelectSearchBox';
import { 
  LOAD_ALL_PART_NAMES,
  SAVE_PLATE_DEFINITION,
} from '../redux/actions';
import { Input, Modal, Button, Radio } from 'antd';

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const WellTd = styled.td`
  border: solid 1px black;
  width:100px;
  height:100px;
`;

const ClickableDiv = styled.div`
  height: 100%;
  background: #eee;
`;

interface IProps extends RouteComponentProps {
  loadAllPartNames: ()=>void;
  dispatchSavePlateDefinition: (data:any)=>void;
  partDict: any;
  
  plateName?: string;
  plateBarcode?: string;
  plateOwner: string;
  plateGroup?: string;
  platePermission?: number;
  parts?: any[];
  currentUserId: string;

}
interface IState {
  plateName: string;
  plateBarcode: string;
  plateOwner: string;
  plateGroup: string;
  platePermission: number;
  parts: any[];

  modalVisible: boolean;
  currentWellId: number;
  currentWellName: string;
  currentWellPart: any;
  // currentSearchValue: string;

  plateType: string;
}

const mapStateToProps = (state: IStoreState) => ({
  partDict: state.app.partDict,
  currentUserId: state.app.currentUser._id,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAllPartNames: ()=>dispatch({type:LOAD_ALL_PART_NAMES}),
  dispatchSavePlateDefinition: (data:any)=>dispatch({type:SAVE_PLATE_DEFINITION, data,})
});

class PlateMapEditor extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.props.loadAllPartNames();
    const {
      plateName,
      plateBarcode,
      plateOwner,
      plateGroup,
      platePermission,
      parts,
    } = props;

    this.state = {
      plateName: plateName || `New Plate ${new Date()}`,
      plateBarcode: plateBarcode || ``,
      plateOwner: plateOwner || props.currentUserId,
      plateGroup: plateGroup || '',
      platePermission: platePermission || 600,
      parts: parts || Array(384).fill({_id:'', name:'empty'}),
      modalVisible:false,
      currentWellId: -1,
      currentWellName: '',
      currentWellPart: {},
      // currentSearchValue: '',

      plateType: '96',

    };
  }

  public render() {
    const colTitles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    const rowTitles = 'ABCDEFGHIJKLMNOP'.split('');
    return (
      <Panel>
        <p>
        <Input placeholder="plate name" />
        </p>
        <p>
        <Input placeholder="barcode" />
        </p>

        <p>
        <Input.TextArea placeholder="description" autosize={{ minRows: 2, maxRows: 6 }}/>
        </p>

        <Radio.Group onChange={this.onChangePlateType} value={this.state.plateType}>
          <Radio value={'96'}>96</Radio>
          <Radio value={'384'}>384</Radio>

        </Radio.Group>

        <p>plate map</p>
        <table>
          <tbody>
          <tr>
            <WellTd/>
            {colTitles.map((v,i)=><WellTd key={i}>{v}</WellTd>)}
          </tr>
          {
            
            rowTitles.map((v,i)=><tr key={i}>
              <WellTd>{v}</WellTd>
              {colTitles.map((vv,ii)=>{
                const wellIdx = i*24+ii;
                const wellName = `${rowTitles[i]}${colTitles[ii]}`;
                return <WellTd key={wellIdx} id={`${wellIdx}`}>
                <ClickableDiv 
                  onClick={this.clickWell.bind(this, wellIdx, wellName)}
                >
                  {wellName}
                  <br/>
                  {this.state.parts[wellIdx].name}
                </ClickableDiv>
              </WellTd>;})}
            </tr>)}
          </tbody>
        </table>
        <Button key="submit" type="primary" onClick={this.handleSavePlate}>
          Save
        </Button>,
        <Modal
          title="Basic Modal"
          visible={this.state.modalVisible && this.state.currentWellId>=0}
          onOk={this.handleModalOK}
          onCancel={this.handleModalCancel}
          footer={[
            <Button key="clear" onClick={this.handleModalClear}>
              Clear
            </Button>,
            <Button key="cancel" onClick={this.handleModalCancel}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleModalOK}>
              OK
            </Button>,
          ]}
        >
          <p>{this.state.currentWellName}</p>
          <PartSelectSearchBox
            value={this.state.parts[this.state.currentWellId]}
            onChange={this.setWellValue.bind(this)}
          />
          
        </Modal>
        
      </Panel>
    );
  }

  private clickWell = (wellId:number, wellName:string) => {
    // console.log(wellId);
    // let {currentSearchValue} = this.state;
    // const {currentWellId, parts} = this.state;
    // if (currentWellId !== wellId) {
    //   currentSearchValue = '';
    // } else {
    //   currentSearchValue = parts[currentWellId]
    // }
    this.setState({
      modalVisible: true,
      currentWellId: wellId,
      currentWellName: wellName,
      currentWellPart: this.state.parts[wellId],
    })
  }

  private handleModalOK = (e:React.MouseEvent<HTMLElement, MouseEvent>)=> {
    const {currentWellId, currentWellPart, parts} = this.state;
    parts[currentWellId] = currentWellPart;
    this.setState({
      parts: [...parts],
      modalVisible: false,
      currentWellId: -1,
      currentWellName: '',
    });
  }

  private handleModalCancel = (e:React.MouseEvent<HTMLElement, MouseEvent>)=> {
    this.setState({
      modalVisible: false,
      currentWellId: -1,
      currentWellName: '',
    });
  }

  private handleModalClear = ()=>{
    const {currentWellId, currentWellPart, parts} = this.state;
    parts[currentWellId] = {_id:'', name:'empty'};
    this.setState({
      parts: [...parts],
      modalVisible: false,
      currentWellId: -1,
      currentWellName: '',
    });
  }

  private setWellValue = (item:any) => {
    this.setState({
      currentWellPart: item,
    })
  }

  private onChangePlateType = (e:any) => {
    this.setState({
      plateType:e.target.value,
    })
  }

  private handleSavePlate = ()=>{
    const {
      plateName,
      plateBarcode,
      plateOwner,
      plateGroup,
      platePermission,
      parts,
    } = this.props;

    this.props.dispatchSavePlateDefinition({
      name:plateName,
      barcode: plateBarcode,
      owner: plateOwner,
      group: plateGroup,
      permission: platePermission,
      parts: parts,
    });
  }

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlateMapEditor));
