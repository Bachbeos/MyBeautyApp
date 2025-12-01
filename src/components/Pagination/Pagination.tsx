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
  perPageOptions = [10, 20, 50], // Mặc định mobile nên xem ít hơn
  showPageSizeChanger = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(total, page * perPage);

  // Logic tính toán các nút trang cần hiển thị (Web Logic Adapted)
  const displayNumber = 1; // Mobile hẹp nên giảm số lượng nút hiển thị xung quanh trang hiện tại
  const pages: (number | '...')[] = [];

  if (totalPages <= displayNumber * 2 + 3) {
    // Logic đơn giản hóa cho mobile
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Luôn hiện trang đầu
    pages.push(1);

    // Tính khoảng giữa
    let startPage = Math.max(2, page - displayNumber);
    let endPage = Math.min(totalPages - 1, page + displayNumber);

    // Điều chỉnh nếu ở gần đầu hoặc cuối
    if (page <= displayNumber + 2) {
      endPage = Math.max(endPage, displayNumber * 2 + 2); // Đảm bảo hiện đủ nút ban đầu
    }
    if (page >= totalPages - (displayNumber + 1)) {
      startPage = Math.min(startPage, totalPages - (displayNumber * 2 + 1));
    }

    if (startPage > 2) pages.push('...');

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push('...');

    // Luôn hiện trang cuối
    if (totalPages > 1) pages.push(totalPages);
  }

  // Helper render nút trang
  const renderPageButton = (p: number | '...', index: number) => {
    if (p === '...') {
      return (
        <View key={`ellipsis-${index}`}>
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
  };

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      {/* Thông tin số dòng */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          Hiển thị <Text style={styles.bold}>{startItem}</Text>-<Text style={styles.bold}>{endItem}</Text> / <Text style={styles.bold}>{total}</Text>{' '}
          kết quả
        </Text>
      </View>

      {/* Danh sách trang */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={[styles.pageBtn, page === 1 && styles.disabledBtn]} disabled={page === 1} onPress={() => onPageChange(page - 1)}>
          <MaterialCommunityIcons name="chevron-left" size={20} color={page === 1 ? '#9ca3af' : '#374151'} />
        </TouchableOpacity>

        {pages.map((p, i) => renderPageButton(p, i))}

        <TouchableOpacity
          style={[styles.pageBtn, page === totalPages && styles.disabledBtn]}
          disabled={page === totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <MaterialCommunityIcons name="chevron-right" size={20} color={page === totalPages ? '#9ca3af' : '#374151'} />
        </TouchableOpacity>
      </View>

      {/* Chọn số dòng/trang */}
      {showPageSizeChanger && onPerPageChange && (
        <View style={styles.limitContainer}>
          <Text style={styles.limitLabel}>Hiển thị:</Text>
          {perPageOptions.map((opt) => (
            <TouchableOpacity key={opt} style={[styles.limitBtn, perPage === opt && styles.limitBtnActive]} onPress={() => onPerPageChange(opt)}>
              <Text style={[styles.limitText, perPage === opt && styles.limitTextActive]}>{opt} / trang</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
