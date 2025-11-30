import { urlsApi } from '../configs/urls';
import { convertParamsToString } from '../utils/convertParams';
import type { IResourceListRequest, IResourceUpdateRequest } from '../model/resource/ResourceRequestModel';

export default {
  // Lấy danh sách tài nguyên
  list: (params: IResourceListRequest, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.resource.list}${convertParamsToString(params)}`, {
      signal,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật tài nguyên
  update: (body: IResourceUpdateRequest, token: string) => {
    return fetch(urlsApi.resource.update, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa tài nguyên
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.resource.delete}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  // Lấy chi tiết tài nguyên theo ID
  detail: (id: number, token: string) => {
    return fetch(`${urlsApi.resource.detail}?id=${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());
  },
};
