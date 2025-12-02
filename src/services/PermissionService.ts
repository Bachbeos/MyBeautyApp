import { urlsApi } from '../configs/urls';
import type { IPermissionUpdateRequest, IPermissionInfoRequest } from '../model/permissions/PermissionRequestModel';

export default {
  // Thêm quyền cho vai trò
  add: (body: IPermissionUpdateRequest, token: string) => {
    return fetch(urlsApi.permission.update, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa quyền cho vai trò
  remove: (body: IPermissionUpdateRequest, token: string) => {
    return fetch(urlsApi.permission.delete, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Lấy cấu hình phân quyền của vai trò
  info: (params: IPermissionInfoRequest, token: string, signal?: AbortSignal) => {
    const queryString = `?roleId=${params.roleId}`;
    return fetch(`${urlsApi.permission.detail}${queryString}`, {
      signal,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  },

  // Lấy danh sách resource/permission của người dùng
  resources: (token: string, signal?: AbortSignal) => {
    return fetch(urlsApi.permission.checkPermission, {
      signal,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  },
};
