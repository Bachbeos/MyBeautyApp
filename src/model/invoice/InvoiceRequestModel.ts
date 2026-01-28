export interface IInvoiceRequest {
  id?: number;
  invoiceCode: string;
  // invoiceType: number;
  amount: number;
  discount: number;
  vatAmount: number;
  fee: number;
  amountCard: number;
  paid: number;
  debt: number;
  paymentType: number;
  status: number;
  statusTemp: number;
  receiptImage?: string;
  receiptDate?: string | Date;
  createdTime?: string | Date;
  updatedTime?: string | Date;
  userId: number;
  customerId: number;
  branchId: number;
  voucherCode?: string;
  note?: string;
}

export interface IInvoiceListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
