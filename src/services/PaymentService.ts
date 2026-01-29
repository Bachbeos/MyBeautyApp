import { urlsApi } from "../configs/urls";

export interface IPaymentRequest {
  invoiceId?: number;
  amount?: number;
}

export default {
  payment: (params: IPaymentRequest, token: string) => {
    const queryString = `?invoiceId=${params.invoiceId}&amount=${params.amount}`;
    const url = `${urlsApi.payment.payment}${queryString}`;

    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: null,
    }).then((res) => res.json());
  },
};
