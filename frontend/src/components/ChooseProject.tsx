/**
 * the panel of selecting projects after loggin
 */
import * as React from 'react';
import { Dispatch } from 'redux';
import {connect} from 'react-redux';

import styled from 'styled-components';
import { RouteComponentProps, withRouter, Link } from 'react-router-dom';
import { IUserInfo, IProject, IStoreState } from '../types';
import {Button, InputGroup, FormControl, FormControlProps} from 'react-bootstrap';

import Switch from '@material-ui/core/Switch';
import { 
  SET_CURRENT_PROJECT, 
  CREATE_PROJECT, 
  GET_MY_PROJECTS, 
  DELETE_PROJECT, 
  RENAME_PROJECT,
} from '../redux/actions';
import pencilSVG from '../icons/tiny-pencil.svg'
import Form from 'react-bootstrap/Form'

const Panel = styled.div`
  margin:30px;
  text-align:left;
`;

const CloseButton = styled(Button)`
  margin-left:10px;
`;


const EditButton = styled.img`
  width:15px;
  height:15px;
  margin-left:5px;
  cursor:pointer;
`

interface IProps extends RouteComponentProps {
  currentUser: IUserInfo;
  projects: IProject[];
  getMyProjects: ()=>void;
  onNewProject: (name:string, history:any) => void;
  onLoadProject: (project: IProject) => void;
  deleteProject: (id: string)=>void;
  renameProject: (id: string, name:string)=>void;
}
interface IState {
  projectName: string;
  editingProjectId?: string;
  editingProjectName: string;
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  projects: state.app.myProjects,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getMyProjects: () => dispatch({type:GET_MY_PROJECTS}),
  onNewProject: (name:string, history:any) => dispatch({type: CREATE_PROJECT, data:{name, history}}),
  onLoadProject: (project: IProject) => dispatch({type: SET_CURRENT_PROJECT, data: project}),
  deleteProject: (_id:string) => dispatch({type:DELETE_PROJECT, data: _id}),
  renameProject: (_id:string, name:string) => dispatch({type:RENAME_PROJECT, data: {_id, name}})
});

class ChooseProject extends React.Component<IProps, IState> {

  public static getDervidedStateFromProps(props: IProps, state: IState) {

  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      editingProjectName: '',
    };
  }

  public componentDidMount() {
    if (this.props.currentUser._id) {
      this.getProjectList();
    }
  }

  public shouldComponentUpdate(np: IProps, ns: IState) {
    if (np.currentUser !== this.props.currentUser && np.currentUser._id) {
      this.getProjectList();
      return false;
    }
    return true;
  }

  public render() {
    return (
      <Panel>
        <div style={{marginTop:30}}>
        <h3>create a project</h3>
        <InputGroup style={{width:600}}>
          <FormControl
            placeholder='filename'
            aria-label='filename'
            aria-describedby='filename'
            value={this.state.projectName}
            onChange={this.onChangeFileName}
          />
          <InputGroup.Append>
            <Button variant='primary' onClick={this.onClickNewProject}>new project</Button>
            <Link to={`/projectWizard?name=${this.state.projectName}`}><Button variant='outline-secondary'>use wizard</Button></Link>
          </InputGroup.Append>
        </InputGroup>
        </div>

        <div style={{marginTop:30}}>
          <h3>generate ECHO protocols</h3>
          <p>generate an echo script for multiple projects</p>
          <Link to={'/generateProtocols'}><Button variant='primary'>start</Button></Link>
        </div>

        <div style={{marginTop:30}}>
          <h3>Parts</h3>
          <p>upload custom parts to the database</p>
          <Link to={'/uploadParts'}><Button variant='primary'>create</Button></Link>
          &nbsp;
          <Link to={'/parts'}><Button variant='primary'>list</Button></Link>
        </div>

        <div style={{marginTop:30}}>
          <h3>Plates</h3>
          <p>create a new plate map to hold parts</p>
          <Link to={'/plate/new'}><Button variant='primary'>create</Button></Link>
          &nbsp;
          <Link to={'/plates'}><Button variant='primary'>list</Button></Link>
        </div>
        
        <div style={{marginTop:30}}>
          <h3>your projects</h3>
          {this.props.projects.map((v, i) =>
          <div key={i}>
            
              {this.state.editingProjectId === v._id
                ?
                <Form.Control 
                  type="text" 
                  placeholder="Normal text" 
                  value={this.state.editingProjectName} 
                  onChange={(event:any)=>this.setState({editingProjectName:event.target.value})}
                  onBlur={this.saveProjectName}
                />
                :
                <div style={{display:'flex', alignItems:'center'}}>
                  
                    <Button variant='link' onClick={this.onClickOpenProject.bind(this, v)}>
                      <span>{v.name}</span>
                    </Button>
                    {v.updatedAt && <span style={{color: '#777', fontSize: '80%', marginRight:20}}> {v.updatedAt.toLocaleDateString()}</span>}
                  
                    <Switch value="checkedA" />
                    <span style={{marginRight:20}}>public </span>
                    {/* <FormControlLabel
                      control={
                        // <Switch checked={state.checkedA} onChange={handleChange('checkedA')} value="checkedA" />
                        
                      }
                      label="Secondary"
                    />             */}
                  
            
                  <EditButton src={pencilSVG} onClick={this.onClickRenameProject.bind(this, v._id!, v.name)}/>
                  <CloseButton variant="text" size="sm" onClick={this.props.deleteProject.bind(this, v._id!)}>X</CloseButton>
                  </div>
                }
            
          </div>,
          )}
        </div>
        
      </Panel>
    );
  }

  public componentWillUnmount() {
  }

  private saveProjectName = ()=>{
    this.setState({editingProjectId:undefined});
    this.props.renameProject(this.state.editingProjectId!, this.state.editingProjectName);
  }

  private onClickRenameProject = (id:string, initialName:string) => {
    this.setState({editingProjectId: id, editingProjectName:initialName});
  }

  private onClickNewProject = () => {
    this.props.onNewProject(this.state.projectName, this.props.history);
    // this.props.history.push(`/project/new`);
  }

  private onClickOpenProject = (project: IProject) => {
    // this.props.onLoadProject(project);
    this.props.history.push(`/project/${project._id}`);
  }

  private onChangeFileName = (event: React.FormEvent<FormControlProps>) => {
    const projectName = (event.target as FormControlProps).value!;
    this.setState({projectName});
  }
  private async getProjectList() {
    this.props.getMyProjects();
      // try {
      //   const projectList = await listMyProjects();
      // } catch (error) {

      // }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChooseProject));
