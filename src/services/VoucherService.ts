import { urlsApi } from "../configs/urls";
import type { IVoucherListRequest, IVoucherRequest } from "../model/voucher/VoucherRequestModel";
import { convertParamsToString } from "../utils/convertParams";

export default {
  list: (params: IVoucherListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.voucher.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  update: (body: IVoucherRequest, token: string) => {
    return fetch(urlsApi.voucher.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.voucher.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  detail: (id: number, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.voucher.detail}/${id}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
