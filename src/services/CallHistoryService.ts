import { urlsApi } from "../configs/urls";
import type { ICallHistoryListRequest, ICallHistoryRequest } from "../model/historyCall/HistoryCallRequestModel";
import { convertParamsToString } from "../utils/convertParams";

export default {
  // Lấy danh sách lịch sử cuộc gọi
  list: (params: ICallHistoryListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.callHistory.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // Thêm/Cập nhật lịch sử cuộc gọi
  update: (body: ICallHistoryRequest, token: string) => {
    return fetch(urlsApi.callHistory.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  updateStatus: (id: number, status: number, token: string) => {
    return fetch(`${urlsApi.callHistory.updateStatus}?id=${id}&status=${status}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
