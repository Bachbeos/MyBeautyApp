import { urlsApi } from "../configs/urls";
import { convertParamsToString } from "../utils/convertParams";

export interface IReportBaseParams {
  year: number;
  [key: string]: unknown;
}

export interface IRevenueParams extends IReportBaseParams {
  month: number;
  [key: string]: unknown;
}

export interface IFrequencyParams extends IReportBaseParams {
  month?: number;
  page?: number;
  size?: number;
  [key: string]: unknown;
}

export interface ICustomerByMonth {
  month: number;
  totalCustomer: number;
}

export interface ICustomerBySource {
  sourceId: number;
  sourceName: string;
  totalCustomer: number;
}

export interface IRevenueData {
  year: number;
  month: number;
  totalRevenue: number;
}

export interface IFrequencyItem extends Record<string, unknown> {
  customerId: number;
  customerName: string;
  totalInvoice: number;
  totalFee: number;
  avgFee: number;
}
export interface IFrequencyResponse {
  items: IFrequencyItem[];
  page: number;
  size: number;
  total: number;
}

export interface IApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface IAvgInterestItem extends Record<string, unknown> {
  // Thêm phần này
  customerId: number;
  customerName: string;
  totalCall: number;
  avgInterestLevel: number;
}

export interface IAvgInterestResponse {
  items: IAvgInterestItem[];
  page: number;
  size: number;
  total: number;
}

// Interface cho biểu đồ cột đôi
export interface IInterestBarData {
  month: number;
  totalCustomer: number;
  highInterestCustomer: number;
}

export default {
  // 1. Báo cáo khách hàng theo tháng
  getCustomerByMonth: (params: IReportBaseParams, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.customerByMonth}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json() as Promise<IApiResponse<ICustomerByMonth[]>>);
  },

  // 2. Báo cáo khách hàng theo nguồn
  getCustomerBySource: (params: IReportBaseParams, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.customerBySource}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json() as Promise<IApiResponse<ICustomerBySource[]>>);
  },

  // 3. Tổng doanh thu trong tháng
  getMonthlyRevenue: (params: IRevenueParams, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.revenueByMonth}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json() as Promise<IApiResponse<IRevenueData>>);
  },

  // 4. Tần suất mua bán (Bảng)
  getFrequency: (params: IFrequencyParams, token: string, signal?: AbortSignal) => {
    return fetch(`${urlsApi.report.frequency}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json() as Promise<IApiResponse<IFrequencyResponse>>);
  },

  // 5. Mức độ quan tâm trung bình (Bảng)
  getCallHistoryAvg: (params: { year: number; month?: number; page?: number; size?: number; keyword?: string }, token: string) => {
    return fetch(`${urlsApi.report.callHistoryAvg}${convertParamsToString(params)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }).then((res) => res.json() as Promise<IApiResponse<IAvgInterestResponse>>);
  },

  // 6. Biểu đồ cột đôi so sánh quan tâm
  getInterestBar: (params: { year: number; minAvgInterest: number }, token: string) => {
    return fetch(`${urlsApi.report.callHistoryInterest}${convertParamsToString(params)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }).then((res) => res.json() as Promise<IApiResponse<IInterestBarData[]>>);
  },
};
