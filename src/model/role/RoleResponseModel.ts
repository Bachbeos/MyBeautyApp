export interface IRoleItem {
  id: number;
  name: string;
  isDefault: number;
  isOperator: number;
  [key: string]: unknown;
}
