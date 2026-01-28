export interface IScheduleResponse {
  id: number;
  title: string;
  creatorId: number;
  content?: string;
  customerId: number;
  userId: number;
  note?: string;
  startTime: string;
  endTime: string;
  type: number;
  branchId: number;
  creatorName?: string;
  customerName?: string;
  branchName?: string;
  [key: string]: unknown;
}
