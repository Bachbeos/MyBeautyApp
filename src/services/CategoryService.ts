import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { ICategoryListRequest, ICategoryRequest } from "../model/category/CategoryRequestModel";

export default {
  // Lấy danh sách danh mục
  list: (params: ICategoryListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.category.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật danh mục
  update: (body: ICategoryRequest, token: string) => {
    return fetch(urlsApi.category.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa danh mục
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.category.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  children: (parentId: number, token: string) => {
    return fetch(`${urlsApi.category.getChild}?parentId=${parentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  updateStatus: (id: number, active: number, token: string) => {
    return fetch(`${urlsApi.category.status}?id=${id}&active=${active}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },
};
