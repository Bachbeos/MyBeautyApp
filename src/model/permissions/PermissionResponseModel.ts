export interface IPermission {
  roleId: number;
  actions: string;
}

export interface IResourcePermissionItem {
  id: number;
  name: string;
  description: string | null;
  code: string;
  uri: string;
  actions: string;
  permission: IPermission;
}

export type IPermissionInfoResponse = IResourcePermissionItem[];
