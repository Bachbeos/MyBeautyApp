import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";

export interface IBoughtServiceRequest {
  id?: number;
  invoiceId: number;
  serviceId: number;
  qty: number;
  price: number;
  fee: number;
  customerId: number;
  status: number;
  note?: string;
}

export default {
  // Thêm hoặc Cập nhật dịch vụ vào hóa đơn
  update: (body: IBoughtServiceRequest, token: string) => {
    return fetch(urlsApi.boughtService.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Lấy danh sách dịch vụ trong hóa đơn (params: { invoiceId, status })
  list: (params: { invoiceId: number; status?: number }, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.boughtService.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Xóa dịch vụ khỏi hóa đơn
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.boughtService.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
