import { urlsApi } from "../configs/urls";
import type { IInvoiceListRequest, IInvoiceRequest } from "../model/invoice/InvoiceRequestModel";
import { convertParamsToString } from "../utils/convertParams";

export interface IRecalculateRequest {
  id?: number;
  amount?: number;
}

export default {
  getDraft: (customerId: number, token: string) => {
    return fetch(`${urlsApi.invoice.draft}?customerId=${customerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  recalculate: (body: IRecalculateRequest, token: string) => {
    return fetch(`${urlsApi.invoice.recalculate}?invoiceId=${body.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: null,
    }).then((res) => res.json());
  },

  // Lấy danh sách hoá đơn
  list: (params: IInvoiceListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.invoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật hoá đơn
  update: (body: IInvoiceRequest, token: string) => {
    return fetch(urlsApi.invoice.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa hoá đơn
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.invoice.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  // applyVoucher: (invoiceId: number, voucherCode: string, amount: number, token: string) => {
  //   return fetch(urlsApi.voucher.applyVoucher, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ invoiceId, code: voucherCode, amount }),
  //   }).then((res) => res.json());
  // },
  applyVoucher: (invoiceId: number, voucherCode: string, amount: number, token: string) => {
    const queryString = `?invoiceId=${invoiceId}&voucherCode=${encodeURIComponent(voucherCode)}&amount=${amount}`;
    const url = `${urlsApi.voucher.applyVoucher}${queryString}`;
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: null,
    }).then((res) => res.json());
  },
  getVoucherByCode: (code: string, token: string) => {
    return fetch(`${urlsApi.voucher.getByCode}?code=${code}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
