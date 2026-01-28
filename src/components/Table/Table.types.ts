import React from "react";
import { StyleProp, ViewStyle } from "react-native";

export type ColumnDef<T> = {
  key: string;
  title?: string;
  dataIndex?: string;
  render?: (record: T) => React.ReactNode;
  width?: number;
  align?: "left" | "center" | "right";
};

export type TableActionProps<T> = {
  row: T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onPermission?: (row: T) => void;
  extra?: (row: T) => React.ReactNode;
};

export type TableProps<T> = {
  columns?: ColumnDef<T>[];
  data: T[];
  selectable?: boolean;
  selectedRows?: T[];
  onSelect?: (selected: T[]) => void;
  actions?: Omit<TableActionProps<T>, "row"> & { label?: string };
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};
