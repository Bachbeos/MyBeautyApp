export interface ICustomerResponse {
  id: number;
  name: string;
  avatar?: string;
  gender?: number;
  age?: number;
  address?: string;
  phone?: string;
  email?: string;
  birthday?: string;
  height?: number;
  weight?: number;
  userId?: number;
  creatorId?: number;
  note?: string;
  createdTime?: string;
  updatedTime?: string;
  lastestContact?: string;
  [key: string]: unknown;
}

export interface ICustomerExtraInfo {
  id?: number | null;
  attributeId: number;
  customerId?: number | null;
  attributeValue?: string | null;
  datatype?: string | null;
  fieldName?: string | null;
  [key: string]: unknown;
}
