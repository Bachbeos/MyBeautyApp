import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { IBranchListRequest, IBranchRequest } from "../model/branch/BranchRequestModel";

export default {
  // Lấy danh sách chi nhánh
  list: (params: IBranchListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.branch.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật chi nhánh
  update: (body: IBranchRequest, token: string) => {
    return fetch(urlsApi.branch.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Xóa chi nhánh
  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.branch.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  // Cập nhật trạng thái
  updateStatus: (id: number, status: number, token: string) => {
    return fetch(`${urlsApi.branch.updateStatus}?id=${id}&status=${status}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },
};
