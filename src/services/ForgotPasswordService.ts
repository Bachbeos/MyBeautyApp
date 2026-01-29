import { urlsApi } from "../configs/urls";

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export default {
  forgot: (body: IForgotPasswordRequest) => {
    return fetch(urlsApi.auth.forgotPassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  reset: (body: IResetPasswordRequest) => {
    return fetch(urlsApi.auth.resetPassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
