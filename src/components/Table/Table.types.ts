import React from 'react';

export type ColumnDef<T = Record<string, unknown>> = {
  key: string;
  title?: string;
  // render trả về ReactNode để hiển thị custom view (ví dụ: Badge, Image)
  render?: (row: T, value: unknown, index: number) => React.ReactNode;
  width?: number; // Thêm width để set chiều rộng cột trên mobile
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
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
  selectable?: boolean;
  selectedRows?: T[];
  onSelect?: (selected: T[]) => void;
  actions?: Omit<TableActionProps<T>, 'row'> & { label?: string };
  isLoading?: boolean;
};
