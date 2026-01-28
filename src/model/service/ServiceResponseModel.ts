export interface IServiceResponse {
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
