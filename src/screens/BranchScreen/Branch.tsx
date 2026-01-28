import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, Image, TouchableOpacity } from "react-native";
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

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={open} />

      <View style={styles.toolbar}>
        <SearchBar placeholder="Tìm chi nhánh..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
        <AddButton
          label="Thêm"
          onClick={() => {
            setModal({ type: "add" });
            setModalShown(true);
          }}
        />
      </View>

      <Table
        data={listBranches}
        columns={columns}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        actions={{
          onEdit: (item) => {
            setModal({ type: "edit", item });
            setModalShown(true);
          },
          onDelete: (item) => {
            setModal({ type: "delete", item });
            setModalShown(true);
          },
          onView: (item) => {
            setModal({ type: "detail", item });
            setModalShown(true);
          },
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
