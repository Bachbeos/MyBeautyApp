export interface IScheduleRequest {
  id?: number;
  title: string;
  content?: string;
  customerId?: number;
  userId?: number;
  note?: string;
  startTime?: string;
  endTime?: string;
  type?: number;
  [key: string]: unknown;
}

export interface IScheduleListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  customerId?: number;
  type?: number;
  [key: string]: unknown;
}
