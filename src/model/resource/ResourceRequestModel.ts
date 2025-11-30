export interface IResourceListRequest {
  name?: string;
  active?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface IResourceUpdateRequest {
  id?: number;
  name: string;
  code: string;
  uri: string;
  actions: string;
  description?: string;
}
