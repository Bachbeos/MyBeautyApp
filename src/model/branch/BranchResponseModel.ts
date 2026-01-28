export interface IBranchResponse {
  id: number;
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
  createdTime: string;
  status: number;
  [key: string]: unknown;
}
