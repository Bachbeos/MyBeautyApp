/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "./Table.styles";
import ActionsTable from "./partials/Action";
import type { TableProps } from "./Table.types";

const COLORS = { primary: "#e41f07", textGray: "#707070" };

export default function Table<T extends object>({
  columns = [],
  data,
  actions,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  contentContainerStyle,
}: TableProps<T>) {
  const renderCardItem = ({ item }: { item: T }) => {
    const titleCol = columns.find((c) => c.key === "name" || c.title?.toLowerCase().includes("tên")) || columns[0];
    const otherCols = columns.filter((c) => c.key !== titleCol?.key);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{titleCol?.render ? titleCol.render(item) : String((item as any)[titleCol?.key || "id"] ?? "")}</Text>
        </View>

        <View>
          {otherCols.map((col) => {
            const valueAlignItems = col.align === "left" ? "flex-start" : col.align === "center" ? "center" : "flex-end";
            const valueTextAlign = col.align === "left" ? "left" : col.align === "center" ? "center" : "right";

            const showLabel = !!col.title && !col.hideLabel;

            return (
              <View key={col.key} style={styles.cardRow}>
                {showLabel && <Text style={[styles.cardLabel, { textAlign: col.labelAlign || "left" }]}>{col.title}</Text>}

                <View style={[styles.cardValue, { alignItems: valueAlignItems }]}>
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text style={[styles.cardValueText, { textAlign: valueTextAlign }]}>{String((item as any)[col.dataIndex || col.key] ?? "")}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {actions && (
          <View style={styles.actionContainer}>
            <ActionsTable
              row={item}
              onEdit={actions.onEdit ? () => actions.onEdit!(item) : undefined}
              onDelete={actions.onDelete ? () => actions.onDelete!(item) : undefined}
              onView={actions.onView ? () => actions.onView!(item) : undefined}
              onPermission={actions.onPermission ? () => actions.onPermission!(item) : undefined}
              extra={actions.extra ? () => actions.extra!(item) : undefined}
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
        keyExtractor={(item: any, index) => (item?.id ? String(item.id) : String(index))}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
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
