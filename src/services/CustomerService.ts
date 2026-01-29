import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { ICustomerListRequest, ICustomerRequest } from "../model/customer/CustomerRequestModel";

export default {
  // Lấy danh sách khách hàng
  list: (params: ICustomerListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật khách hàng
  update: (body: ICustomerRequest, token: string) => {
    return fetch(urlsApi.customer.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa khách hàng
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.customer.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  detail: (id: number, token: string) => {
    return fetch(`${urlsApi.customer.detail}?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  // Lấy thông tin động theo khách hàng
  listByCustomer: (customerId: number, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customer.extraInfo}?customerId=${customerId}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
