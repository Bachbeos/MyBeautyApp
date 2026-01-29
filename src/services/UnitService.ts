import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { IUnitListRequest, IUnitRequest } from "../model/unit/UnitRequestModel";

export default {
  // Lấy danh sách đơn vị
  list: (params: IUnitListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.unit.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật đơn vị
  update: (body: IUnitRequest, token: string) => {
    return fetch(urlsApi.unit.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa đơn vị
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.unit.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },
};
