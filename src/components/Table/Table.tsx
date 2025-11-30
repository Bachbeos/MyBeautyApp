/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from './Table.styles';
import ActionsTable from './partials/Action';
import type { TableProps, ColumnDef } from './Table.types';

// Helper: Chuyển camelCase thành Title Case
function humanize(str: string) {
  return String(str)
    .replace(/[_-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

// Helper: Convert giá trị thành string để hiển thị
function stringify(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// [MỚI] Helper: Map giá trị align ('left', 'right') sang alignItems của React Native
const getAlignItems = (align?: 'left' | 'center' | 'right'): ViewStyle['alignItems'] => {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    case 'left':
    default:
      return 'flex-start';
  }
};

const DEFAULT_COLUMN_WIDTH = 120; // Chiều rộng mặc định nếu không set

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  selectable = false,
  selectedRows = [],
  onSelect,
  isLoading = false,
}: TableProps<T>) {
  // 1. Tự động suy luận cột nếu không truyền props 'columns'
  const inferredColumns: ColumnDef<T>[] = useMemo(() => {
    if (columns && columns.length) return columns;
    if (!data || data.length === 0) return [];

    // Lấy key từ phần tử đầu tiên
    const keys = Object.keys(data[0]);
    return keys.map((k) => ({
      key: k,
      title: humanize(k),
      width: DEFAULT_COLUMN_WIDTH,
    }));
  }, [columns, data]);

  // 2. Logic Select Rows
  const selectedIds = selectedRows.map((row) => (row as any).id);

  const handleSelectAll = () => {
    if (!onSelect) return;
    if (selectedRows.length === data.length) {
      onSelect([]); // Bỏ chọn hết
    } else {
      onSelect([...data]); // Chọn hết
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelect) return;
    const id = (row as any).id;
    const isSelected = selectedIds.includes(id);

    if (isSelected) {
      onSelect(selectedRows.filter((r) => (r as any).id !== id));
    } else {
      onSelect([...selectedRows, row]);
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  // 3. Render
  return (
    <View style={styles.container}>
      {/* Scroll Ngang cho nội dung bảng */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.scrollContainer}>
        <View>
          {/* --- HEADER --- */}
          <View style={styles.headerRow}>
            {/* Checkbox Header */}
            {selectable && (
              <TouchableOpacity onPress={handleSelectAll} style={styles.checkboxContainer}>
                <MaterialCommunityIcons
                  name={allSelected ? 'checkbox-marked' : someSelected ? 'minus-box' : 'checkbox-blank-outline'}
                  size={22}
                  color={allSelected || someSelected ? '#e41f07' : '#9ca3af'}
                />
              </TouchableOpacity>
            )}

            {/* Data Columns Header */}
            {inferredColumns.map((col) => (
              <View
                key={col.key}
                style={[
                  styles.headerCell,
                  {
                    width: col.width || DEFAULT_COLUMN_WIDTH,
                    alignItems: getAlignItems(col.align), // [SỬA] Sử dụng hàm helper
                  },
                ]}
              >
                <Text style={styles.headerText}>{col.title}</Text>
              </View>
            ))}

            {/* Actions Header */}
            {actions && (
              <View style={styles.actionContainer}>
                <Text style={styles.headerText}>{actions.label || 'Actions'}</Text>
              </View>
            )}
          </View>

          {/* --- BODY --- */}
          {isLoading ? (
            <View style={[styles.emptyContainer, { width: '100%' }]}>
              <ActivityIndicator size="large" color="#e41f07" />
            </View>
          ) : data.length === 0 ? (
            <View style={[styles.emptyContainer, { width: '100%' }]}>
              <MaterialCommunityIcons name="database-off" size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            data.map((row, index) => {
              const isSelected = selectedIds.includes((row as any).id);
              return (
                <View key={(row as any).id || index} style={[styles.row, isSelected && styles.rowSelected]}>
                  {/* Checkbox Row */}
                  {selectable && (
                    <TouchableOpacity onPress={() => handleSelectRow(row)} style={styles.checkboxContainer}>
                      <MaterialCommunityIcons
                        name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={22}
                        color={isSelected ? '#e41f07' : '#9ca3af'}
                      />
                    </TouchableOpacity>
                  )}

                  {/* Data Columns Row */}
                  {inferredColumns.map((col) => {
                    const value = (row as any)[col.key];
                    return (
                      <View
                        key={col.key}
                        style={[
                          styles.cell,
                          {
                            width: col.width || DEFAULT_COLUMN_WIDTH,
                            alignItems: getAlignItems(col.align), // [SỬA] Sử dụng hàm helper
                          },
                        ]}
                      >
                        {col.render ? (
                          col.render(row, value, index)
                        ) : (
                          <Text style={styles.cellText} numberOfLines={1}>
                            {stringify(value)}
                          </Text>
                        )}
                      </View>
                    );
                  })}

                  {/* Actions Row */}
                  {actions && (
                    <View style={styles.actionContainer}>
                      <ActionsTable
                        row={row}
                        onEdit={actions.onEdit}
                        onDelete={actions.onDelete}
                        onView={actions.onView}
                        onPermission={actions.onPermission}
                        extra={actions.extra}
                      />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
