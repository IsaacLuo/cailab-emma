import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IPartName} from '../types.js';
import { Dispatch } from 'redux';
import { Select, Button } from 'antd';
import styled from 'styled-components';
const { Option } = Select;


interface IProps {
  value?: any;
  partNames: IPartName[];
  partDict: any;
  onChange?: (value: any)=>void;
}

interface IState {
  filteredPartNames:IPartName[],
  searchValue:string,
  selectedValue: any,
}

const mapStateToProps = (state: IStoreState) => ({
  partNames: state.app.partNames,
  partDict: state.app.partDict,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({

});

class PartSelectSearchBox extends React.Component<IProps, IState> {

  static getDerivedStateFromProps(props:IProps, state:IState) {
    return {
      ...state,
      selectedValue: props.value? state.selectedValue ? state.selectedValue : {key:props.value._id, label:props.value.name} : undefined, 
      filteredPartNames: state.searchValue === '' ? props.partNames : props.partNames.filter((v)=>`${v.name} ${v.labName}`.indexOf(state.searchValue)>=0),
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      filteredPartNames:props.partNames,
      searchValue: '',
      selectedValue: this.props.value ? {key:this.props.value._id, label:this.props.value.name} : undefined,
    }
  }
  public render() {
    const options = this.state.filteredPartNames.map(d => <Option key={d._id}>{`${d.name}(${d.labName})`}</Option>);
    return <Select
        showSearch
        labelInValue
        value={this.state.selectedValue}
        placeholder={'empty'}
        style={{width:400}}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.onSearch}
        onChange={this.onChange}
        notFoundContent={null}
      >
        {options}
      </Select>
  }



  private onChange = (item:any) => {
    console.log(item);
    if (this.props.onChange) this.props.onChange({_id:item.key, name:item.label});
    this.setState({selectedValue:item});
  }

  private onBlur = () => {
    console.log('blur');
  }

  private onFocus = () => {
    console.log('focus');
  }

  private onSearch = (val:string) => {
    console.log('search', val);
    this.setState({searchValue:val});
  }
}

// export default PartSelectSearchBox
export default connect(mapStateToProps, mapDispatchToProps)(PartSelectSearchBox)

