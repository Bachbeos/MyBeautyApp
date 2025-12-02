export interface IPaginationState {
  page: number;
  limit: number;
  totalItem: number;
  totalPage: number;
  setPage: (page: number) => void;
  chooseLimit: (limit: number) => void;
}
