import * as React from 'react'
import { Form, Input, Button, Select } from 'antd';
import { Tooltip } from '@material-ui/core';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { NEW_PART } from './actions';
import { Breadcrumb } from 'react-bootstrap';

const PART_4BP = {
  '1': ['TAGG', 'ATGG'], //1
  '2': ['ATGG', 'GACT'], //2
  '3': ['GACT', 'GGAC'], //3
  '4': ['GGAC', 'TCCG'], //4
  '5': ['TCCG', 'CCAG'], //6
  '6': ['CCAG', 'CAGC'],
  '7': ['CAGC', 'AGGC'],
  '8': ['AGGC', 'GCGT'],
  '8a': ['AGGC', 'ATCC'],
  '8b': ['ATCC', 'GCGT'],
  '9': ['GCGT', 'TGCT'],
  '10': ['TGCT', 'GGTA'],
  '11': ['GGTA', 'CGTC'],
  '12': ['CGTC', 'TCAC'],
  '13': ['TCAC', 'CTAC'],
  '14': ['CTAC', 'GCAA'],
  '15': ['GCAA', 'CCCT'],
  '16': ['CCCT', 'GCTC'],
  '17': ['GCTC','CGGT'],
  '18': ['CGGT', 'GACG'],
  '19': ['GTGC', 'AGCG'],
  '20': ['AGCG', 'TGGA'],
  '21': ['TGGA', 'GTTG'],
  '22': ['GTTG', 'CGAA'],
  '23': ['CGAA', 'CACG'],
  '24': ['CACG', 'ACTG'],
  '25': ['ACTG', 'ACGA'],
};

const PART_4BP_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '8a', '8b', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'];

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
  const dispatch = useDispatch();

  const onFinish = (values:any) => {
    dispatch({type:NEW_PART, data: values})
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <React.Fragment>
    <Form {...layout} form={form} initialValues={{ position:'1' }} name="control-hooks" onFinish={onFinish}>
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
        <Select>
          {PART_4BP_KEYS.map((v,i)=>
            <Select.Option value={v} key={i}>{v}</Select.Option>
          )}
        </Select>
      </Form.Item>
      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input/>
      </Form.Item>
      <Form.Item
        name="labName"
        label="Lab Name"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input/>
      </Form.Item>
      <Form.Item
        name="category"
        label="Category"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input/>
      </Form.Item>
      <Form.Item
        name="comment"
        label="Comment"
        rules={[
          {
            required: false,
          },
        ]}
      >
        <Input/>
      </Form.Item>
      <Form.Item
        name="sequence"
        label="Sequence"
        rules={[
          {
            required: true,
            validator: async(rule, value) => {
              const overhangs = PART_4BP[form.getFieldValue('position') as keyof typeof PART_4BP];
              const reg = new RegExp(`^${overhangs[0]}[A|T|C|G]+${overhangs[1]}$`,'i');
              if (reg.test(value)) {
                return Promise.resolve();
              } else {
                return Promise.reject(`the sequence should begin with ${overhangs[0]} and end with ${overhangs[1]}, full of AGCT and no spaces`);
              }
            }
          },
        ]}
      >
        <Input/>
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
    </Form>
    </React.Fragment>
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