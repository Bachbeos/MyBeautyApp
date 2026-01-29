import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./Branch.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalBranch from "./partials/ModalBranch";
import BranchService from "../../services/BranchService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { IBranchResponse } from "../../model/branch/BranchResponseModel";
import type { IBranchRequest, IBranchListRequest } from "../../model/branch/BranchRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function BranchScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listBranches, setListBranches] = useState<IBranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IBranchResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<IBranchListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("BRANCH_VIEW");
        const valAdd = await SecureStore.getItemAsync("BRANCH_ADD");
        const valEdit = await SecureStore.getItemAsync("BRANCH_UPDATE");
        const valDelete = await SecureStore.getItemAsync("BRANCH_DELETE");
        setCanView(valView === "1");
        setCanAdd(valAdd === "1");
        setCanEdit(valEdit === "1");
        setCanDelete(valDelete === "1");
      } catch (error) {
        setCanView(false);
        setCanAdd(false);
        setCanEdit(false);
        setCanDelete(false);
      }
    };
    loadPermissions();
  }, []);

  useEffect(() => {
    getListBranches(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListBranches = async (requestParams: IBranchListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => BranchService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListBranches(response.result.items || []);
      pagination.updatePagination?.(response.result.total ?? 0, response.result.page ?? requestParams.page, requestParams.limit);
    } else {
      toast.show(response?.message ?? "Lỗi tải dữ liệu");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getListBranches({ ...params, page: 1 }, true);
  };

  const handleToggleStatus = async (branch: IBranchResponse) => {
    const token = await getToken();
    if (!token) return;

    const newStatus = Number(branch.status) === 1 ? 0 : 1;
    const oldStatus = Number(branch.status);

    setListBranches((prev) => prev.map((item) => (item.id === branch.id ? { ...item, status: newStatus } : item)));

    const response = await BranchService.updateStatus(branch.id, newStatus, token);

    if (response?.code === 200) {
      toast.show("Đổi trạng thái thành công");
    } else {
      toast.show("Đổi trạng thái thất bại");
      setListBranches((prev) => prev.map((item) => (item.id === branch.id ? { ...item, status: oldStatus } : item)));
    }
  };

  const handleSaveBranch = async (payload: IBranchRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await BranchService.update(payload, token);

    if (response?.code === 200) {
      toast.show(modal.type === "add" ? "Thêm mới thành công" : "Cập nhật thành công");
      setModalShown(false);
      getListBranches(params);
    } else {
      toast.show(response?.message ?? "Có lỗi xảy ra");
    }
  };

  const handleDeleteBranch = async () => {
    if (!modal.item) return;
    const token = await getToken();
    if (!token) return;

    const response = await BranchService.delete(modal.item.id, token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getListBranches(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const columns: ColumnDef<IBranchResponse>[] = [
    {
      key: "name",
      title: "Chi nhánh",
      render: (item) => (
        <View style={styles.cellAvatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.cellTextBold} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cellText} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: "status",
      title: "Trạng thái hoạt động",
      render: (item) => (
        <Switch
          trackColor={{ false: "#767577", true: COLORS.primary }}
          thumbColor={COLORS.white}
          value={Number(item.status) === 1}
          onValueChange={() => handleToggleStatus(item)}
        />
      ),
    },
  ];

  if (canView === null) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (canView === false) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <Header onMenuPress={open} />
        <View style={{ flex: 1 }}>
          <ErrorPage505 />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={open} />

      <View style={styles.toolbar}>
        <SearchBar placeholder="Tìm chi nhánh..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
        {canAdd && (
          <AddButton
            label="Thêm mới"
            onClick={() => {
              setModal({ type: "add" });
              setModalShown(true);
            }}
          />
        )}
      </View>

      <Table
        data={listBranches}
        columns={columns}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        actions={{
          onEdit: canEdit
            ? (item) => {
                setModal({ type: "edit", item });
                setModalShown(true);
              }
            : undefined,
          onDelete: canDelete
            ? (item) => {
                setModal({ type: "delete", item });
                setModalShown(true);
              }
            : undefined,
          onView: canView
            ? (item) => {
                setModal({ type: "detail", item });
                setModalShown(true);
              }
            : undefined,
        }}
      />

      {!isLoading && listBranches.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalBranch
        visible={modalShown}
        type={modal.type}
        item={modal.item}
        onClose={() => setModalShown(false)}
        onSubmit={handleSaveBranch}
        onDelete={handleDeleteBranch}
      />
    </SafeAreaView>
  );
}
