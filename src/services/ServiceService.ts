import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { IServiceListRequest, IServiceRequest } from "../model/service/ServiceRequestModel";

export default {
  // Lấy danh sách dịch vụ
  list: (params: IServiceListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.service.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật dịch vụ
  update: (body: IServiceRequest, token: string) => {
    return fetch(urlsApi.service.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa dịch vụ
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.service.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  // Lấy đơn vị sản phẩm
  getUnit: (params: IServiceListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.unit.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Lấy danh mục sản phẩm
  getCategory: (params: IServiceListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.category.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
