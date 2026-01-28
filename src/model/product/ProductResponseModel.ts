export interface IProductResponse {
  id?: number | undefined;
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
  cost?: number;
  [key: string]: unknown;
}
