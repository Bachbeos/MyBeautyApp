import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { ICustomerSourceListRequest, ICustomerSourceRequest } from "../model/customerSource/CustomerSourceRequestModel";

export default {
  list: (params: ICustomerSourceListRequest, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerSource.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  update: (body: ICustomerSourceRequest, token: string) => {
    return fetch(urlsApi.customerSource.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.customerSource.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  detail: (id: number, token: string) => {
    return fetch(`${urlsApi.customerSource.detail}?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
