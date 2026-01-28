export interface ICallHistoryRequest {
  id?: number;
  userId: number;
  customerId: number;
  callType: number;
  outcome: number;
  interestLevel: number;
  duration: number;
  note?: string;
  status: number;
  [key: string]: unknown;
}

export interface ICallHistoryListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
