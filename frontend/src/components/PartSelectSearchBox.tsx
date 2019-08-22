import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IPartName} from '../types.js';
import { Dispatch } from 'redux';
import { Select } from 'antd';
import styled from 'styled-components';
const { Option } = Select;


interface IProps {
  value?: string;
  partNames: IPartName[];
  partDict: any;
  onChange?: (value: string)=>void;
}

interface IState {
  filteredPartNames:IPartName[],
  searchValue:string,
  selectedValue: string,
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
      searchValue: state.searchValue,
      filteredPartNames: state.searchValue === '' ? props.partNames : props.partNames.filter((v)=>`${v.name} ${v.labName}`.indexOf(state.searchValue)>=0),
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      filteredPartNames:props.partNames,
      searchValue: '',
      selectedValue: this.props.value || '',
    }
  }
  public render() {
    const options = this.state.filteredPartNames.map(d => <Option key={d._id}>{`${d.name}(${d.labName})`}</Option>);
    return <div>
      <Select
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
    </div>
  }



  private onChange = (item:any) => {
    console.log(item);
    if (this.props.onChange) this.props.onChange(item);
    this.setState({selectedValue:item.label});
  }

  private onBlur = () => {
    console.log('blur');
  }

  private onFocus = () => {
    console.log('focus');
  }

  private onSearch = (val:string) => {
    this.setState({searchValue:val});
  }
}

// export default PartSelectSearchBox
export default connect(mapStateToProps, mapDispatchToProps)(PartSelectSearchBox)

