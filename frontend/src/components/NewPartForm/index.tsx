import * as React from 'react'
import { Form, Input, Button, Select } from 'antd';
import { newPart } from './saga';
import { Tooltip } from '@material-ui/core';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const NewPartForm = () => {
  const [form] = Form.useForm();

  const onGenderChange = (value:any) => {
    switch (value) {
      case 'male':
        form.setFieldsValue({
          note: 'Hi, man!',
        });
        return;

      case 'female':
        form.setFieldsValue({
          note: 'Hi, lady!',
        });
        return;

      case 'other':
        form.setFieldsValue({
          note: 'Hi there!',
        });
    }
  };

  const onFinish = (values:any) => {
    console.log(values);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    form.setFieldsValue({
      note: 'Hello world!',
      gender: 'male',
    });
  };

  return (
    <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
      <Form.Item
        name="position"
        label={ <span>Position&nbsp; <Tooltip title="from 1 to 23 (and 8a, 8b)">
        <QuestionCircleOutlined />
        </Tooltip>
        </span>}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="gender"
        label="Gender"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          placeholder="Select a option and change input text above"
          onChange={onGenderChange}
          allowClear
        >
          <Option value="male">male</Option>
          <Option value="female">female</Option>
          <Option value="other">other</Option>
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}
      >
        {({ getFieldValue }) =>
          getFieldValue('gender') === 'other' ? (
            <Form.Item
              name="customizeGender"
              label="Customize Gender"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
        <Button type="link" htmlType="button" onClick={onFill}>
          Fill form
        </Button>
      </Form.Item>
    </Form>
  );
};

export default NewPartForm;




// // react
// import * as React from 'react';
// // redux
// import { Dispatch } from 'redux';
// import {connect} from 'react-redux';
// // antd
// import {
//   Form,
//   Input,
//   Tooltip,
//   Button,
//   InputNumber,
// } from 'antd';
// import { FormProps } from 'antd/lib/form';
// import { IStoreState } from '../../types';
// import { NEW_PART, RESET_FORM } from './actions';
// import { QuestionCircleOutlined } from '@ant-design/icons';

// interface IProps extends FormProps {
//   resetForm: boolean;
//   dispatchNewPart: (form:any) => void;
//   dispatchResetForm: (flag:boolean) =>void;
// }

// interface IState {
//   confirmDirty: boolean;
//   autoCompleteResult: string[];
// }

// const mapStateToProps = (state: IStoreState) => ({
//   resetForm: state.newPartForm.resetForm,
// });

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//   dispatchNewPart: (form:any)=>dispatch({type:NEW_PART, data:form}),
//   dispatchResetForm: (flag:boolean)=>dispatch({type:RESET_FORM, data:flag}),
// });

// class NewPartForm extends React.Component<IProps, IState> {
//   constructor(props: IProps) {
//     super(props);
//     this.state = {
//       confirmDirty: false,
//       autoCompleteResult: [],
//     };
//   }

//   validateToPositionNames = (rule:any, value:string, callback:(...args:string[])=>void) => {
//     const { form } = this.props;
//     const positions = ['1', '2', '3', '4', '5', '6', '7', '8a', '8b', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '8'];
//     if (value && positions.indexOf(form!.getFieldValue('position'))<0) {
//       callback('position is invalid');
//     } else {
//       callback();
//     }
//   };

//   onFinishForm = (values:any) => {
//     console.log(values);
//     // e.preventDefault();
//     // if (this.props.form) {
//     //   this.props.form.validateFieldsAndScroll((err, values) => {
//     //     if (!err) {
//     //       console.log('Received values of form: ', values);
//     //       this.props.dispatchNewPart(values);
//     //     }
//     //   });
//     // }
//   }

//   handleResetButton = () => {
//     if(this.props.form) {
//       this.props.form.resetFields();
//     }
//   }

//   handleConfirmBlur = (e:any) => {
//     const { value } = e.target;
//     this.setState({ confirmDirty: this.state.confirmDirty || !!value });
//   };

//   public shouldComponentUpdate(np:IProps, ns:IState) {
//     if(np.resetForm) {
//       this.props.dispatchResetForm(false);
//       if(this.props.form) {
//         this.props.form.resetFields();
//       }
//       return false;
//     }
//     return true;
//   }

//   render() {
//     const { getFieldDecorator } = this.props.form!;

//     const formItemLayout = {
//       labelCol: {
//         xs: { span: 24 },
//         sm: { span: 4 },
//       },
//       wrapperCol: {
//         xs: { span: 24 },
//         sm: { span: 20 },
//       },
//     };
//     const tailFormItemLayout = {
//       wrapperCol: {
//         xs: {
//           span: 24,
//           offset: 0,
//         },
//         sm: {
//           span: 16,
//           offset: 8,
//         },
//       },
//     };

//     // const websiteOptions = autoCompleteResult.map(website => (
//     //   <AutoCompleteOption key={website}>{website}</AutoCompleteOption>
//     // ));

//     return (
//       <Form {...formItemLayout} onFinish={this.onFinishForm}>
//         <Form.Item label={<span>
//           Position&nbsp;
//           <Tooltip title="from 1 to 23 (and 8a, 8b)">
//             <QuestionCircleOutlined />
//               </Tooltip>
//         </span>} hasFeedback>
//           {getFieldDecorator('position', {
//             rules: [
//               {
//                 required: true,
//                 message: 'Please input position name!',
//               },
//               {
//                 validator: this.validateToPositionNames,
//               },
//             ],
//           })(<Input />)}
//         </Form.Item>

//         <Form.Item
//           label='name'
//         >
//           {getFieldDecorator('name', {
//             rules: [
//               { required: true, 
//                 message: 'Please input the name!', 
//                 whitespace: true, 
//               }
//             ],
//           })(<Input />)}
//         </Form.Item>

//         <Form.Item
//           label='labName'
//         >
//           {getFieldDecorator('labName', {
//             rules: [
//               { required: true, 
//                 message: 'Please input the name!', 
//                 whitespace: true, 
//               }
//             ],
//           })(<Input />)}
//         </Form.Item>

//         <Form.Item
//           label='category'
//         >
//           {getFieldDecorator('category', {
//             rules: [
//               { required: true, 
//                 message: 'Please input the category!', 
//                 whitespace: true, 
//               }
//             ],
//           })(<Input />)}
//         </Form.Item>

//         <Form.Item
//           label='comment'
//         >
//           {getFieldDecorator('comment', {
//             rules: [],
//           })(<Input />)}
//         </Form.Item>

//         <Form.Item
//           label='sequence'
//         >
//           {getFieldDecorator('sequence', {
//             rules: [
//               { required: true, 
//                 message: 'Please input the sequence!', 
//                 whitespace: true, 
//               }
//             ],
//           })(<Input />)}
//         </Form.Item>

//         <Form.Item label="plasmidLength">
//           {getFieldDecorator('plasmidLength', { initialValue: 1500 })(<InputNumber min={1} max={10000} />)}
//           <span className="ant-form-text"> bp</span>
//         </Form.Item>

        
//         <Form.Item {...tailFormItemLayout}>
//           <Button type="primary" htmlType="submit">
//             Create
//           </Button>
//           &nbsp;
//           <Button type="primary" onClick={this.handleResetButton}>
//             Reset
//           </Button>
//         </Form.Item>
//       </Form>
//     );
//   }
// }

// const WrappedNewPartForm = Form.create({ name: 'newPart' })(NewPartForm);
// const ReduxWrappedComp = connect(mapStateToProps, mapDispatchToProps)(WrappedNewPartForm);
// // export default WrappedNewPartForm as any;
// export default ReduxWrappedComp as any;