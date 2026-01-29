import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { ICustomerAttributeListRequest, ICustomerAttributeRequest } from "../model/customerAttribute/CustomerAttributeRequestModel";

export default {
  // Lấy danh sách thuộc tính khách hàng
  list: (params: ICustomerAttributeListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật thuộc tính khách hàng
  update: (body: ICustomerAttributeRequest, token: string) => {
    return fetch(urlsApi.customerAttribute.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa thuộc tính khách hàng
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.customerAttribute.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  //Lấy danh sách thuộc tính con
  listChildren: (token?: string, signal?: AbortSignal) => {
    const url = `${urlsApi.customerAttribute.list}?isParent=0`;
    return fetch(url, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
