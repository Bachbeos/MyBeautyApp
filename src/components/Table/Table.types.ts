import React from 'react';

export type ColumnDef<T = Record<string, unknown>> = {
  key: string;
  title?: string;
  dataIndex?: string; // Hỗ trợ lấy field con
  render?: (record: T) => React.ReactNode; // Simplification cho mobile
  width?: number;
  align?: 'left' | 'center' | 'right';
};

export type TableActionProps<T = Record<string, unknown>> = {
  row: T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onPermission?: (row: T) => void;
  extra?: (row: T) => React.ReactNode;
};

export type TableProps<T = Record<string, unknown>> = {
  columns?: ColumnDef<T>[];
  data: T[];
  selectable?: boolean; // Mobile ít dùng select multi, nhưng giữ lại interface
  selectedRows?: T[];
  onSelect?: (selected: T[]) => void;
  actions?: Omit<TableActionProps<T>, 'row'> & { label?: string };
  isLoading?: boolean;
  // Props cho Mobile Pull-to-refresh
  onRefresh?: () => void;
  isRefreshing?: boolean;
};
