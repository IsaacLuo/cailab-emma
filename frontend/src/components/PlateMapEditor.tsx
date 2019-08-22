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
import { LOAD_ALL_PART_NAMES } from '../redux/actions';
import { Modal, Button } from 'antd';

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
  partDict: any;
}
interface IState {
  selectedParts: any[];
  modalVisible: boolean;
  currentWellId: number;
  currentWellName: string;
}

const mapStateToProps = (state: IStoreState) => ({
  partDict: state.app.partDict,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAllPartNames: ()=>dispatch({type:LOAD_ALL_PART_NAMES}),
});

class PlateMapEditor extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.props.loadAllPartNames();
    this.state = {
      selectedParts: Array(384).fill({_id:undefined, text:'empty'}),
      modalVisible:false,
      currentWellId: -1,
      currentWellName: '',
    };
  }

  public render() {
    const colTitles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    const rowTitles = 'ABCDEFGHIJKLMNOP'.split('');
    return (
      <Panel>
        <table>
          <tbody>
          <tr>
            <WellTd/>
            {colTitles.map((v,i)=><WellTd key={i}>{v}</WellTd>)}
          </tr>
          {
            
            rowTitles.map((v,i)=><tr>
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
                  {this.state.selectedParts[wellIdx].text}
                </ClickableDiv>
              </WellTd>;})}
            </tr>)}
          </tbody>
        </table>
        <Modal
          title="Basic Modal"
          visible={this.state.modalVisible && this.state.currentWellId>=0}
          onOk={this.handleModalOK}
          onCancel={this.handleModalCancel}
        >
          <p>{this.state.currentWellName}</p>
          <PartSelectSearchBox
            value={this.state.selectedParts[this.state.currentWellId]}
            onChange={this.setWellValue.bind(this)}
          />
        </Modal>
        
      </Panel>
    );
  }

  private clickWell = (wellId:number, wellName:string) => {
    console.log(wellId);
    this.setState({
      modalVisible: true,
      currentWellId: wellId,
      currentWellName: wellName,
    })
  }

  private handleModalOK = (e:React.MouseEvent<HTMLElement, MouseEvent>)=> {
    

    this.setState({
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

  private setWellValue = (item:any) => {
    const partId = item.key;
    const partName = item.label;
    const {currentWellId} = this.state;
    console.log(partName);
    // this.setState({
      
    // })
  }

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlateMapEditor));
