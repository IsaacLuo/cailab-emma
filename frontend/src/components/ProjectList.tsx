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
  GET_SHARED_PROJECTS,
  CLONE_PROJECT,
  SET_PROJECT_PERMISSION,
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
  sharedProjects:IProject[];
  getMyProjects: ()=>void;
  onNewProject: (name:string, history:any) => void;
  onLoadProject: (project: IProject) => void;
  deleteProject: (id: string)=>void;
  renameProject: (id: string, name:string)=>void;
  getSharedProjects:()=>void;
  dispatchCloneProject: (_id:string, cb:(newId:string)=>void)=>void;
  dispatchSetPublic: (_id:string, val:number)=>void;
}
interface IState {
  projectName: string;
  editingProjectId?: string;
  editingProjectName: string;
}

const mapStateToProps = (state: IStoreState) => ({
  currentUser: state.app.currentUser,
  projects: state.app.myProjects,
  sharedProjects: state.app.sharedProjects,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getMyProjects: () => dispatch({type:GET_MY_PROJECTS}),
  onNewProject: (name:string, history:any) => dispatch({type: CREATE_PROJECT, data:{name, history}}),
  onLoadProject: (project: IProject) => dispatch({type: SET_CURRENT_PROJECT, data: project}),
  deleteProject: (_id:string) => dispatch({type:DELETE_PROJECT, data: _id}),
  renameProject: (_id:string, name:string) => dispatch({type:RENAME_PROJECT, data: {_id, name}}),
  getSharedProjects: ()=>dispatch({type:GET_SHARED_PROJECTS}),
  dispatchCloneProject: (_id:string, cb:(newId:string)=>void)=>dispatch({type:CLONE_PROJECT, data:{_id, cb}}),
  dispatchSetPublic: (_id:string, val:number)=>dispatch({type:SET_PROJECT_PERMISSION, data:{_id,val}}),
});

class ProjectList extends React.Component<IProps, IState> {


  constructor(props: IProps) {
    super(props);
    this.state = {
      projectName: `project ${new Date().toLocaleString()}`,
      editingProjectName: '',
    };
  }

  public componentDidMount() {
    if (this.props.currentUser._id) {
      console.log(this.props.currentUser);
      this.getProjectList();
      this.props.getSharedProjects();
    }
  }

  public shouldComponentUpdate(np: IProps, ns: IState) {
    if (np.currentUser !== this.props.currentUser && np.currentUser._id) {
      this.getProjectList();
      this.props.getSharedProjects();
      return false;
    }
    return true;
  }

  public render() {
    return (
      <Panel>
        <div style={{marginTop:30}}>
          <h3>your projects</h3>
          {this.props.projects.map((v:IProject, i) =>
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
                  
                    <Switch 
                      checked={!!(v.permission&0x004)}
                      onChange={this.onChangePublicSwitch.bind(this, v._id!)}/>
                    <span style={{marginRight:20}}>share to others</span>
            
                  <EditButton src={pencilSVG} onClick={this.onClickRenameProject.bind(this, v._id!, v.name)}/>
                  <CloseButton variant="text" size="sm" onClick={this.props.deleteProject.bind(this, v._id!)}>X</CloseButton>
                  </div>
                }
            
          </div>,
          )}
        </div>

        <div style={{marginTop:30}}>
          <h3>public projects</h3>
          {this.props.sharedProjects.map((v, i) =>
          <div key={i}>
            <div style={{display:'flex', alignItems:'center'}}>
              
                <Button variant='link' onClick={this.onClickCloneProject.bind(this, v)}>
                  <span>{v.name}</span>
                </Button>
                {v.owner && <span style={{color: '#777', fontSize: '80%', marginRight:20}}> {v.owner.name}</span>}
                {v.updatedAt && <span style={{color: '#777', fontSize: '80%', marginRight:20}}> {v.updatedAt.toLocaleDateString()}</span>}
                <Button variant='link' onClick={this.onClickCloneProject.bind(this, v)}>
                  <span>fork</span>
                </Button>
              </div>
          </div>,
          )}
        </div>
        
      </Panel>
    );
  }

  public componentWillUnmount() {
  }

  private onChangePublicSwitch = (_id:string, event:React.ChangeEvent<HTMLInputElement>, checked:boolean)=>{
    this.props.dispatchSetPublic(_id, checked?0x666:0x600);
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

  private onClickCloneProject = (project: IProject) => {
    // this.props.onLoadProject(project);
    this.props.dispatchCloneProject(project._id!, (newProjectId:string)=>this.props.history.push(`/project/${newProjectId}`));
    
  }

  private onChangeFileName = (event:any) => {
    const projectName = (event.target as FormControlProps).value! as string|undefined;
    if (projectName) this.setState({projectName});
  }
  private async getProjectList() {
    this.props.getMyProjects();
      // try {
      //   const projectList = await listMyProjects();
      // } catch (error) {

      // }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProjectList));
