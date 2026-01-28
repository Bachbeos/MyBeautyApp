export interface IProductRequest {
  id?: number;
  name?: string;
  categoryId?: number;
  categoryName?: string;
  content?: string;
  code?: string;
  avatar?: string;
  price?: number;
  discount?: number;
  discountUnit?: number;
  position?: number;
  status?: number;
  unitId?: number;
  unitName?: string;
  type?: number;
  expiredPeriod?: number;
  [key: string]: unknown;
}

export interface IProductListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
