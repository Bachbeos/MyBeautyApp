export interface IServiceRequest {
  id?: number | undefined;
  name?: string;
  categoryId?: number;
  categoryName?: string;
  code?: string;
  avatar?: string;
  intro?: string;
  cost?: number;
  price?: number;
  discount?: number;
  priceVariation?: string;
  totalTime?: number;
  isCombo?: number;
  featured?: number;
  treatmentNum?: number;
  parentId?: number;
  [key: string]: unknown;
}

export interface IComboItem {
  priceId?: string;
  name: string;
  price: number;
  discount: number;
  treatmentNum: number;
}

export interface IServiceListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryId?: number;
  isCombo?: number;
  featured?: number;
  [key: string]: unknown;
}
