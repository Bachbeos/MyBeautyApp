import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from './Pagination.styles';

export type PaginationProps = {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  showPageSizeChanger?: boolean;
};

export default function Pagination({
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 15],
  showPageSizeChanger = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const renderPages = () => {
    const pages: (number | '...')[] = [];
    const delta = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > delta + 2) pages.push('...');

      const start = Math.max(2, page - delta);
      const end = Math.min(totalPages - 1, page + delta);

      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - delta - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      {/* Dãy nút phân trang (Next/Prev + Số) */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={[styles.pageBtn, page === 1 && styles.disabledBtn]} disabled={page === 1} onPress={() => onPageChange(page - 1)}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={page === 1 ? '#bdc3c7' : '#374151'} />
        </TouchableOpacity>

        {renderPages().map((p, index) => {
          if (p === '...') {
            return (
              <View key={`ellipsis-${index}`} style={{ height: 40, justifyContent: 'flex-end' }}>
                <Text style={styles.ellipsisText}>...</Text>
              </View>
            );
          }
          const pageNum = Number(p);
          const isActive = pageNum === page;
          return (
            <TouchableOpacity key={pageNum} style={[styles.pageBtn, isActive && styles.activeBtn]} onPress={() => onPageChange(pageNum)}>
              <Text style={[styles.pageText, isActive && styles.activeText]}>{pageNum}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.pageBtn, page === totalPages && styles.disabledBtn]}
          disabled={page === totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color={page === totalPages ? '#bdc3c7' : '#374151'} />
        </TouchableOpacity>
      </View>

      {/* Chọn số dòng/trang (Chips) */}
      {showPageSizeChanger && onPerPageChange && (
        <View style={styles.limitContainer}>
          {perPageOptions.map((opt) => (
            <TouchableOpacity key={opt} style={[styles.limitBtn, perPage === opt && styles.limitBtnActive]} onPress={() => onPerPageChange(opt)}>
              <Text style={[styles.limitText, perPage === opt && styles.limitTextActive]}>{opt}/trang</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
