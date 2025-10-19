import { API_BASE } from '@env';
const baseUrl = API_BASE;

export const urlsApi = {
  user: {
    login: `${baseUrl}/user/authenticate`,
    register: `${baseUrl}/user/create`,
    list: `${baseUrl}/user/list`,
    update: `${baseUrl}/user/update`,
    delete: `${baseUrl}/user/delete`,
    detail: `${baseUrl}/user/getById`,
    updatePassword: `${baseUrl}/user/update-password`,
    updateStatus: `${baseUrl}/user/update-status`,
  },
  role: {
    list: `${baseUrl}/role/list`,
    update: `${baseUrl}/role/update`,
    delete: `${baseUrl}/role/delete`,
  },
  resource: {
    list: `${baseUrl}/resource/list`,
    update: `${baseUrl}/resource/update`,
    delete: `${baseUrl}/resource/delete`,
    detail: `${baseUrl}/resource/getById`,
  },
  permission: {
    update: `${baseUrl}/permission/add`,
    delete: `${baseUrl}/permission/remove`,
    detail: `${baseUrl}/permission/info`,
    checkPermission: `${baseUrl}/permission/resource`,
  },
  branch: {
    list: `${baseUrl}/branch/list`,
    update: `${baseUrl}/branch/update`,
    delete: `${baseUrl}/branch/delete`,
    updateStatus: `${baseUrl}//branch/update-status`,
  },
};
