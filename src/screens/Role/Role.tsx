import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from 'expo-toast';
import { Ionicons } from '@expo/vector-icons';

// Styles
import { styles, COLORS } from './Role.styles';

// Components
import Header from '../../components/Header/Header';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/Pagination';
import RoleModal from './partials/ModalRole';
import AddButton from '../../components/AddButton/AddButton';
import SearchBar from '../../components/Searchbar/Searchbar';
import ExportButton from '../../components/ExportButton/ExportButton';
import RefreshButton from '../../components/RefreshButton/RefreshButton';
import CollapseButton from '../../components/CollapseButton/CollapseButton';

// Hooks & Utils
import RoleService from '../../services/RoleService';
import { getToken, runWithDelay } from '../../utils/common';
import { useSidebar } from '../../components/Sidebar/SidebarContext';
import { usePagination } from '../../hooks/usePagination';
import type { IRoleItem } from '../../model/role/RoleResponseModel';
import type { IRoleListRequest, IRoleUpdateRequest } from '../../model/role/RoleRequestModel';
import { ColumnDef } from '../../components/Table/Table.types';

export default function RoleScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  // State
  const [listRoles, setListRoles] = useState<IRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null; item?: IRoleItem | null }>({ type: null, item: null });
  const [modalShown, setModalShown] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // Params & Pagination
  const [params, setParams] = useState<IRoleListRequest>({ page: 1, limit: 10, keyword: '' });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    getListRoles(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListRoles = async (requestParams: IRoleListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) return setIsLoading(false);

    abortController.current = new AbortController();
    const response = await runWithDelay(() => RoleService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListRoles(response.result.items || []);
      pagination.updatePagination?.(response.result.total ?? 0, response.result.page ?? requestParams.page, requestParams.limit);
    } else {
      toast.show(response?.message ?? 'Lỗi tải dữ liệu');
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getListRoles({ ...params, page: 1 }, true);
  };

  // --- HANDLERS ---
  const handleTogglePermission = async (role: IRoleItem, field: 'isDefault' | 'isOperator', value: boolean) => {
    const token = await getToken();
    if (!token) return;

    setUpdatingIds((prev) => [...prev, role.id]);
    // Optimistic Update (Cập nhật UI trước)
    setListRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, [field]: value ? 1 : 0 } : r)));

    const payload: IRoleUpdateRequest = {
      id: role.id,
      name: role.name,
      isDefault: field === 'isDefault' ? (value ? 1 : 0) : role.isDefault,
      isOperator: field === 'isOperator' ? (value ? 1 : 0) : role.isOperator,
    };

    const response = await RoleService.update(payload, token);
    if (response?.code === 200) {
      toast.show('Cập nhật thành công');
    } else {
      toast.show('Cập nhật thất bại');
      // Revert nếu lỗi
      setListRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, [field]: !value ? 1 : 0 } : r)));
    }
    setUpdatingIds((prev) => prev.filter((id) => id !== role.id));
  };

  const handleSaveRole = async (payload: IRoleUpdateRequest) => {
    const token = await getToken();
    if (!token) return;

    setIsLoading(true);
    const response = await RoleService.update(payload, token);
    setIsLoading(false);

    if (response?.code === 200) {
      toast.show(modal.type === 'add' ? 'Thêm mới thành công' : 'Cập nhật thành công');
      setModalShown(false);
      getListRoles(params);
    } else {
      toast.show(response?.message ?? 'Có lỗi xảy ra');
    }
  };

  const handleDeleteRole = async () => {
    if (!modal.item) return;
    const token = await getToken();
    if (!token) return;

    setIsLoading(true);
    const response = await RoleService.delete(modal.item.id, token);
    setIsLoading(false);

    if (response?.code === 200) {
      toast.show('Xóa thành công');
      setModalShown(false);
      getListRoles(params);
    } else {
      toast.show(response?.message ?? 'Xóa thất bại');
    }
  };

  const columns: ColumnDef<IRoleItem>[] = [
    {
      key: 'name',
      title: 'Tên vai trò',
      render: (item) => <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.name}</Text>,
    },
    {
      key: 'isDefault',
      title: 'Quyền mặc định',
      render: (item) => (
        <Switch
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={COLORS.white}
          value={item.isDefault === 1}
          onValueChange={(val) => handleTogglePermission(item, 'isDefault', val)}
          disabled={updatingIds.includes(item.id)}
        />
      ),
    },
    {
      key: 'isOperator',
      title: 'Quyền điều hành',
      render: (item) => (
        <Switch
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={COLORS.white}
          value={item.isOperator === 1}
          onValueChange={(val) => handleTogglePermission(item, 'isOperator', val)}
          disabled={updatingIds.includes(item.id)}
        />
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {!headerCollapsed && <Header onMenuPress={open} />}

      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <SearchBar
          placeholder="Tìm kiếm vai trò..."
          onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))}
          value={params.keyword}
        />
        <AddButton
          label="Thêm"
          onClick={() => {
            setModal({ type: 'add' });
            setModalShown(true);
          }}
        />
      </View>
      <View style={styles.toolbarExtra}>
        <ExportButton onExport={() => {}} />
        <RefreshButton onRefresh={() => getListRoles(params)} />
        <CollapseButton active={headerCollapsed} onCollapse={() => setHeaderCollapsed((prev) => !prev)} />
      </View>

      <Table
        data={listRoles}
        columns={columns}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        actions={{
          onEdit: (item) => {
            setModal({ type: 'edit', item });
            setModalShown(true);
          },
          onDelete: (item) => {
            setModal({ type: 'delete', item });
            setModalShown(true);
          },
        }}
      />

      {!isLoading && listRoles.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <RoleModal
        visible={modalShown}
        type={modal.type}
        item={modal.item}
        onClose={() => setModalShown(false)}
        onSubmit={handleSaveRole}
        onDelete={handleDeleteRole}
      />
    </SafeAreaView>
  );
}
