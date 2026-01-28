export interface IUnitItem {
  id: number;
  name?: string;
  position?: number;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
  [key: string]: unknown;
}
