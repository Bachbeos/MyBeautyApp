export interface ICustomerAttributeRequest {
  id?: number;
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

export interface ICustomerAttributeListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
