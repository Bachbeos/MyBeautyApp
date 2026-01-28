export interface IBranchRequest {
  id?: number;
  parentId?: number;
  avatar?: string;
  name: string;
  address?: string;
  website?: string;
  description?: string;
  foundingYear?: number;
  foundingMonth?: number;
  foundingDay?: number;
  phone?: string;
  email?: string;
  ownerId?: number;
  status?: number;
  [key: string]: unknown;
}

export interface IBranchListRequest {
  page?: number;
  limit?: number;
  keyword?: string;
  [key: string]: unknown;
}
