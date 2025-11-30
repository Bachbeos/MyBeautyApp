/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Table from '../../components/Table/Table';
import type { ColumnDef } from '../../components/Table/Table.types';
import ResourceModal, { IResourceItem } from './partials/ModalResources';
import styles from './ResourceScreen.styles';

// Mock API Call (Thay thế bằng ResourcesService thực tế của bạn)
const mockApiData: IResourceItem[] = [
  {
    id: 1,
    name: 'Laptop Dell',
    code: 'RES001',
    description: 'Máy tính văn phòng',
    status: 'active',
    actions: '["edit", "delete"]',
    created_at: '2023-10-01',
  },
  {
    id: 2,
    name: 'Máy chiếu Sony',
    code: 'RES002',
    description: 'Máy chiếu phòng họp lớn',
    status: 'inactive',
    actions: '["view"]',
    created_at: '2023-10-05',
  },
  { id: 3, name: 'Bàn làm việc', code: 'RES003', description: '', status: 'active', actions: '[]', created_at: '2023-11-12' },
];

export default function ResourcesScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IResourceItem[]>([]);
  const [searchText, setSearchText] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | 'detail' | null>(null);
  const [selectedItem, setSelectedItem] = useState<IResourceItem | null>(null);

  useEffect(() => {
    fetchData();
  }, [page, searchText]);

  const fetchData = async () => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      // Logic lọc đơn giản
      const filtered = mockApiData.filter(
        (item) => item.name.toLowerCase().includes(searchText.toLowerCase()) || item.code.toLowerCase().includes(searchText.toLowerCase()),
      );
      setData(filtered);
      setLoading(false);
    }, 500);
  };

  // --- Handlers ---
  const handleOpenAdd = () => {
    setModalType('add');
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (item: IResourceItem) => {
    setModalType('edit');
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleOpenDelete = (item: IResourceItem) => {
    setModalType('delete');
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleOpenView = (item: IResourceItem) => {
    setModalType('detail');
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleSubmit = (formData: IResourceItem) => {
    setLoading(true);
    // Mock Submit
    setTimeout(() => {
      if (modalType === 'add') {
        const newItem = { ...formData, id: Date.now() };
        setData([newItem, ...data]);
      } else if (modalType === 'edit' && selectedItem) {
        setData(data.map((d) => (d.id === selectedItem.id ? { ...d, ...formData } : d)));
      }
      setLoading(false);
      setModalVisible(false);
    }, 500);
  };

  const handleDelete = (id: string | number) => {
    setLoading(true);
    // Mock Delete
    setTimeout(() => {
      setData(data.filter((d) => d.id !== id));
      setLoading(false);
      setModalVisible(false);
    }, 500);
  };

  // --- Table Columns Definition ---
  const columns: ColumnDef<IResourceItem>[] = [
    { key: 'code', title: 'Mã', width: 100 },
    { key: 'name', title: 'Tên tài nguyên', width: 180 },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 120,
      align: 'center',
      render: (_, value) => {
        const isActive = value === 'active';
        return (
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={isActive ? styles.badgeTextActive : styles.badgeTextInactive}>{isActive ? 'Hoạt động' : 'Dừng'}</Text>
          </View>
        );
      },
    },
    { key: 'created_at', title: 'Ngày tạo', width: 120 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Tài nguyên" />

      <View style={styles.content}>
        {/* Control Bar: Search & Add */}
        <View style={styles.controlBar}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
              <TextInput style={styles.searchInput} placeholder="Tìm kiếm tài nguyên..." value={searchText} onChangeText={setSearchText} />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleOpenAdd}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Table */}
        <Table
          data={data}
          columns={columns}
          isLoading={loading}
          actions={{
            label: 'Hành động',
            onEdit: handleOpenEdit,
            onDelete: handleOpenDelete,
            onView: handleOpenView,
          }}
        />

        {/* Pagination (Giản lược) */}
        <View style={styles.paginationContainer}>
          <Text style={styles.pageInfo}>Trang {page} / 5</Text>
          <View style={styles.pageButtons}>
            <TouchableOpacity
              style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.pageBtn} onPress={() => setPage((p) => p + 1)}>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <Footer />
      </View>

      {/* Modal */}
      <ResourceModal
        visible={modalVisible}
        type={modalType}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}
