export interface IResourceItem {
  id: number;
  name: string;
  code: string;
  uri: string;
  actions: string;
  description?: string;
  [key: string]: unknown;
}
