import { IProject } from './types';
import axios from 'axios';
import conf from './conf';

export async function getProjectById(projectId: string) {
  const response = await axios.get(conf.serverURL + `/api/project/${projectId}`, {withCredentials: true});
  return response.data;
}

export async function saveProject(project: IProject) {
  const response = await axios.put(conf.serverURL + `/api/project/${project._id}`, project, {withCredentials: true});
  return response.data;
}

export async function listMyProjects() {
  const response = await axios.get(conf.serverURL + `/api/projects/`, {withCredentials: true});
  const projects = response.data.map(
    (v: any) => ({...v, createdAt: new Date(v.createdAt), updatedAt: new Date(v.updatedAt)}),
  );
  return projects as IProject[];
}
