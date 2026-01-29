import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { IProductListRequest, IProductRequest } from "../model/product/ProductRequestModel";

export default {
  // Lấy danh sách sản phẩm
  list: (params: IProductListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật sản phẩm
  update: (body: IProductRequest, token: string) => {
    return fetch(urlsApi.product.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa sản phẩm
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.product.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  // Lấy đơn vị sản phẩm
  getUnit: (params: IProductListRequest, token?: string, signal?: AbortSignal) => {
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
  getCategory: (params: IProductListRequest, token?: string, signal?: AbortSignal) => {
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
