/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from './Table.styles';
import ActionsTable from './partials/Action';
import type { TableProps, ColumnDef } from './Table.types';

const COLORS = { primary: '#e41f07', textGray: '#707070' };

export default function Table<T extends Record<string, unknown>>({
  columns = [],
  data,
  actions,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: TableProps<T>) {
  const renderCardItem = ({ item }: { item: T }) => {
    // 1. Xác định Tiêu đề Card (Thường là cột thứ 2 - Name, hoặc cột đầu tiên - ID)
    // Nếu có cột "name" hoặc "title", ưu tiên dùng nó làm Header Card
    const titleCol = columns.find((c) => c.key === 'name' || c.title?.toLowerCase().includes('tên')) || columns[0];
    const otherCols = columns.filter((c) => c.key !== titleCol?.key);

    return (
      <View style={styles.card}>
        {/* --- HEADER CỦA CARD --- */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{titleCol?.render ? titleCol.render(item) : (item as any)[titleCol?.key || 'id']}</Text>
          {/* Hiển thị ID nhỏ ở góc nếu có */}
          {/* {(item as any).id && <Text style={styles.cardId}>#{(item as any).id}</Text>} */}
        </View>

        {/* --- BODY CỦA CARD (Các cột còn lại) --- */}
        <View>
          {otherCols.map((col) => (
            <View key={col.key} style={styles.cardRow}>
              <Text style={styles.cardLabel}>{col.title}</Text>
              <View style={styles.cardValue}>
                {col.render ? col.render(item) : <Text style={styles.cardValueText}>{String((item as any)[col.dataIndex || col.key] ?? '')}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* --- FOOTER CỦA CARD (ACTIONS) --- */}
        {actions && (
          <View style={styles.actionContainer}>
            <ActionsTable
              row={item}
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
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderCardItem}
        keyExtractor={(item: any) => (item.id ? item.id.toString() : Math.random().toString())}
        contentContainerStyle={styles.listContent}
        refreshControl={onRefresh ? <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} /> : undefined}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-hidden" size={64} color={COLORS.textGray} />
              <Text style={styles.emptyText}>Không tìm thấy dữ liệu</Text>
            </View>
          ) : null
        }
        ListFooterComponent={isLoading && !isRefreshing ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} /> : null}
      />
    </View>
  );
}
