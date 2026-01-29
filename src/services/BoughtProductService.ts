import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";

export interface IBoughtProductRequest {
  id?: number;
  invoiceId: number;
  productId: number;
  unitId: number;
  qty: number;
  price: number;
  fee: number;
  customerId: number;
  status: number;
  note?: string;
}

export default {
  update: (body: IBoughtProductRequest, token: string) => {
    return fetch(urlsApi.boughtProduct.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  list: (params: { invoiceId: number; status?: number }, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.boughtProduct.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Xóa sản phẩm khỏi hóa đơn
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.boughtProduct.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
