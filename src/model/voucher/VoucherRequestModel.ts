export interface IVoucherRequest {
  id?: number;
  code: string;
  name: string;
  discountType: number;
  discountValue: number;
  maxDiscount?: number;
  minInvoiceAmount: number;
  totalQuantity: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  status: number;
  branchId?: number;
  description?: string;
  usageQuantity?: number;
  [key: string]: unknown;
}

export interface IVoucherListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: number;
  branchId?: number;
  [key: string]: unknown;
}
