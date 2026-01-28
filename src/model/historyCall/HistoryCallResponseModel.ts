export interface ICallHistoryResponse {
  id: number;
  userId: number;
  customerId: number;
  callType: number;
  outcome: number;
  interestLevel: number;
  duration: number;
  note: string;
  status: number;
  createdTime: string;
  userName?: string;
  customerName?: string;
  customerPhone?: string;
  customerAvatar?: string;
  [key: string]: unknown;
}
