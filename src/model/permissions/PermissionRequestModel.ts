export interface IPermissionUpdateRequest {
  roleId: number;
  resourceId: number;
  actions: string;
}

export interface IPermissionInfoRequest {
  roleId: number;
}
