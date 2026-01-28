export interface IVoucherResponse {
  id: number;
  code: string;
  name: string;
  discountType: number;
  discountValue: number;
  maxDiscount?: number;
  minInvoiceAmount?: number;
  totalQuantity: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  status: number;
  branchId?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  usageQuantity?: number;
  [key: string]: unknown;
}
