import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { IStoreState, IPartName} from '../types.js';
import { Dispatch } from 'redux';
import { Select } from 'antd';
const { Option } = Select;
import styled from 'styled-components';

interface IProps {
  partNames: IPartName[];
}

interface IState {
  searchValue:string
}

const mapStateToProps = (state: IStoreState) => ({
  partNames: state.app.partNames,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({

});

class PartSelectSearchBox extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      searchValue: '',
    }
  }
  public render() {
    const options = this.props.partNames.map(d => <Option key={d._id}>{d.name}({d.labName})</Option>);
    return <div>
      <Select
        showSearch
        value={this.state.searchValue}
        placeholder={'empty'}
        // style={this.props.style}
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



  private onChange = (value:string) => {
    console.log(`selected ${value}`);
  }

  private onBlur = () => {
    console.log('blur');
  }

  private onFocus = () => {
    console.log('focus');
  }

  private onSearch = (val:string) => {
    console.log('search:', val);
  }
}

// export default PartSelectSearchBox
export default connect(mapStateToProps, mapDispatchToProps)(PartSelectSearchBox)

