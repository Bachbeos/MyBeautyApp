export interface ICustomerAttributeResponse {
  id: number;
  name: string;
  fieldName: string;
  datatype: string;
  attributes?: string;
  required?: number;
  readonly?: number;
  uniqued?: number;
  position?: number;
  parentId?: number;
  createdAt?: string;
  [key: string]: unknown;
}
