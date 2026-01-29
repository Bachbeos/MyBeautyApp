import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./CustomerSource.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalCustomerSource from "./partials/ModalCustomerSource";
import CustomerSourceService from "../../services/CustomerSourceService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { ICustomerSourceResponse } from "../../model/customerSource/CustomerSourceResponseModel";
import type { ICustomerSourceListRequest, ICustomerSourceRequest } from "../../model/customerSource/CustomerSourceRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function CustomerSourceScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listData, setListData] = useState<ICustomerSourceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: ICustomerSourceResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<ICustomerSourceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("CUSTOMER_SOURCE_VIEW");
        const valAdd = await SecureStore.getItemAsync("CUSTOMER_SOURCE_ADD");
        const valEdit = await SecureStore.getItemAsync("CUSTOMER_SOURCE_UPDATE");
        const valDelete = await SecureStore.getItemAsync("CUSTOMER_SOURCE_DELETE");
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
    getData(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getData = async (requestParams: ICustomerSourceListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerSourceService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListData(response.result.items || []);
      pagination.updatePagination?.(response.result.total ?? 0, response.result.page ?? requestParams.page, requestParams.limit);
    } else {
      toast.show(response?.message ?? "Lỗi tải dữ liệu");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getData({ ...params, page: 1 }, true);
  };

  const handleToggleStatus = async (item: ICustomerSourceResponse) => {
    const token = await getToken();
    if (!token) return;
    const newStatus = Number(item.status) === 1 ? 0 : 1;
    const oldStatus = Number(item.status);
    setListData((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));

    const payload: ICustomerSourceRequest = {
      id: item.id,
      name: item.name,
      status: newStatus,
    };

    const response = await CustomerSourceService.update(payload, token);

    if (response?.code === 200) {
      toast.show("Đổi trạng thái thành công");
    } else {
      toast.show("Đổi trạng thái thất bại");
      setListData((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: oldStatus } : i)));
    }
  };

  const handleSave = async (payload: ICustomerSourceRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await CustomerSourceService.update(payload, token);

    if (response?.code === 200) {
      toast.show(modal.type === "add" ? "Thêm mới thành công" : "Cập nhật thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!modal.item) return;
    const token = await getToken();
    if (!token) return;
    const response = await CustomerSourceService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const columns: ColumnDef<ICustomerSourceResponse>[] = [
    {
      key: "name",
      title: "Nguồn khách hàng",
      render: (item) => (
        <View style={styles.cellContainer}>
          <Text style={styles.cellTextBold} numberOfLines={2}>
            {item.name}
          </Text>
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
      width: 80,
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
        <SearchBar placeholder="Tìm kiếm..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
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
        data={listData}
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

      {!isLoading && listData.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalCustomerSource
        shown={modalShown}
        type={modal.type}
        item={modal.item}
        onClose={() => setModalShown(false)}
        onSubmit={handleSave}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}
