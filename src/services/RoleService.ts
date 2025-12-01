import { urlsApi } from '../configs/urls';
import { convertParamsToString } from '../utils/convertParams';
import type { IRoleListRequest, IRoleUpdateRequest } from '../model/role/RoleRequestModel';

export default {
  // Lấy danh sách role
  list: (params: IRoleListRequest, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.role.list}${convertParamsToString(params)}`, {
      signal,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật role
  update: (body: IRoleUpdateRequest, token: string) => {
    return fetch(urlsApi.role.update, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa role
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.role.delete}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },
};
