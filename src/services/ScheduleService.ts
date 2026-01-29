import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";
import type { IScheduleListRequest, IScheduleRequest } from "../model/schedule/ScheduleRequestModel";

export default {
  list: (params: IScheduleListRequest, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.schedule.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  update: (body: IScheduleRequest, token: string) => {
    return fetch(urlsApi.schedule.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  delete: (id: number, token: string) => {
    return fetch(`${urlsApi.schedule.delete}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  },

  detail: (id: number, token?: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.schedule.detail}/${id}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
};
