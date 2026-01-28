export interface ICategoryResponse {
  id: number;
  name: string;
  avatar?: string;
  type?: number;
  level?: number;
  parentId?: number;
  featured?: string;
  position?: number;
  active?: number;
  [key: string]: unknown;
}
