import { IProject } from './types';
import axios from 'axios';
import conf from './conf';

export async function getProjectById(projectId: string) {
  const response = await axios.get(conf.serverURL + `/api/project/${projectId}`, {withCredentials: true});
  return response.data;
}

export async function saveProject(project: IProject) {
  const response = await axios.put(conf.serverURL + `/api/project/${project._uuid}`, project, {withCredentials: true});
  return response.data;
}
