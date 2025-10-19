import { urlsApi } from '../configs/urls';
import type {
  IUserLoginRequest,
  IUserRegisterRequest,
  IUserListRequest,
} from '../model/user/UserRequestModel';
// import { convertParamsToString } from "../utils/convertParams";

export default {
  // Đăng nhập
  login: (body: IUserLoginRequest) => {
    return fetch(urlsApi.user.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Đăng ký
  register: (body: IUserRegisterRequest) => {
    return fetch(urlsApi.user.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // Lấy danh sách người dùng
  //   list: (params: IUserListRequest, token: string, signal?: AbortSignal) => {
  //     return fetch(`${urlsApi.user.list}${convertParamsToString(params)}`, {
  //       signal,
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     }).then((res) => res.json());
  //   },

  // Cập nhật người dùng
  //   update: (body: IUserListRequest, token: string) => {
  //     return fetch(urlsApi.user.update, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(body),
  //     }).then((res) => res.json());
  //   },

  // Xoá người dùng
  //   delete: (id: string, token: string) => {
  //     return fetch(`${urlsApi.user.delete}?id=${id}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }).then((res) => res.json());
  //   },

  // Lấy chi tiết người dùng theo ID
  //   detail: (id: string, token: string) => {
  //     return fetch(`${urlsApi.user.detail}?id=${id}`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }).then((res) => res.json());
  //   },

  // Cập nhật mật khẩu
  //   updatePassword: (id: string, newPassword: string, token: string) => {
  //     return fetch(urlsApi.user.updatePassword, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ id, newPassword }),
  //     }).then((res) => res.json());
  //   },

  // Cập nhật trạng thái (kích hoạt / vô hiệu hoá)
  //   updateStatus: (id: string, isActive: boolean, token: string) => {
  //     return fetch(urlsApi.user.updateStatus, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ id, isActive }),
  //     }).then((res) => res.json());
  //   },
};
