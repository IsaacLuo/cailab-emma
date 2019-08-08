// react
import * as React from 'react';
// redux
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

// styled
import styled from 'styled-components';

// antd
import {
  Form,
  Input,
  Tooltip,
  Icon,
  Cascader,
  Select,
  Row,
  Col,
  Checkbox,
  Button,
  AutoComplete,
  InputNumber,
} from 'antd';
import { FormProps } from 'antd/lib/form';

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;

interface IProps extends FormProps {
}

interface IState {
  confirmDirty: boolean;
  autoCompleteResult: string[];
}

class NewPartForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      confirmDirty: false,
      autoCompleteResult: [],
    };
  }

  handleSubmit = (e:any) => {
    e.preventDefault();
    if (this.props.form) {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
        }
      });
    }
  };

  handleConfirmBlur = (e:any) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  validateToPositionNames = (rule:any, value:string, callback:(...args:string[])=>void) => {
    const { form } = this.props;
    const positions = ['1', '2', '3', '4', '5', '6', '7', '8a', '8b', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '8'];
    if (value && positions.indexOf(form!.getFieldValue('position'))<0) {
      callback('position is invalid');
    } else {
      callback();
    }
  };

  compareToFirstPassword = (rule:any, value:string, callback:(...args:string[])=>void) => {
    const { form } = this.props;
    if (value && value !== form!.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule:any, value:string, callback:(...args:string[])=>void) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form!.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  handleWebsiteChange = (value:any) => {
    let autoCompleteResult:string[];
    if (!value) {
      autoCompleteResult = [];
    } else {
      autoCompleteResult = ['.com', '.org', '.net'].map(domain => `${value}${domain}`);
    }
    this.setState({ autoCompleteResult });
  };

  render() {
    const { getFieldDecorator } = this.props.form!;
    const { autoCompleteResult } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>,
    );

    const websiteOptions = autoCompleteResult.map(website => (
      <AutoCompleteOption key={website}>{website}</AutoCompleteOption>
    ));

    return (
      <Form {...formItemLayout} onSubmit={this.handleSubmit}>
        <Form.Item label={<span>
          Position&nbsp;
          <Tooltip title="from 1 to 23 (and 8a, 8b)">
                <Icon type="question-circle-o" />
              </Tooltip>
        </span>} hasFeedback>
          {getFieldDecorator('position', {
            rules: [
              {
                required: true,
                message: 'Please input position name!',
              },
              {
                validator: this.validateToPositionNames,
              },
            ],
          })(<Input />)}
        </Form.Item>

        <Form.Item
          label='name'
        >
          {getFieldDecorator('name', {
            rules: [
              { required: true, 
                message: 'Please input the name!', 
                whitespace: true, 
              }
            ],
          })(<Input />)}
        </Form.Item>

        <Form.Item
          label='labName'
        >
          {getFieldDecorator('labName', {
            rules: [
              { required: true, 
                message: 'Please input the name!', 
                whitespace: true, 
              }
            ],
          })(<Input />)}
        </Form.Item>

        <Form.Item
          label='category'
        >
          {getFieldDecorator('category', {
            rules: [
              { required: true, 
                message: 'Please input the category!', 
                whitespace: true, 
              }
            ],
          })(<Input />)}
        </Form.Item>

        <Form.Item
          label='comment'
        >
          {getFieldDecorator('comment', {
            rules: [],
          })(<Input />)}
        </Form.Item>

        <Form.Item
          label='sequence'
        >
          {getFieldDecorator('sequence', {
            rules: [
              { required: true, 
                message: 'Please input the sequence!', 
                whitespace: true, 
              }
            ],
          })(<Input />)}
        </Form.Item>

        <Form.Item label="plasmidLength">
          {getFieldDecorator('plasmidLength', { initialValue: 1500 })(<InputNumber min={1} max={10000} />)}
          <span className="ant-form-text"> bp</span>
        </Form.Item>

        
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedNewPartForm = Form.create({ name: 'newPart' })(NewPartForm);

export default WrappedNewPartForm;