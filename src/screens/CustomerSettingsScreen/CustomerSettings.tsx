import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./CustomerSettings.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalCustomerSetting from "./partials/ModalCustomerSettings";
import CustomerAttributeService from "../../services/CustomerAttributeService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { ICustomerAttributeResponse } from "../../model/customerAttribute/CustomerAttributeResponseModel";
import type { ICustomerAttributeListRequest, ICustomerAttributeRequest } from "../../model/customerAttribute/CustomerAttributeRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function CustomerSettingsScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listData, setListData] = useState<ICustomerAttributeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: ICustomerAttributeResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<ICustomerAttributeListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("CUSTOMER_ATTRIBUTE_VIEW");
        const valAdd = await SecureStore.getItemAsync("CUSTOMER_ATTRIBUTE_ADD");
        const valEdit = await SecureStore.getItemAsync("CUSTOMER_ATTRIBUTE_UPDATE");
        const valDelete = await SecureStore.getItemAsync("CUSTOMER_ATTRIBUTE_DELETE");
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

  const getData = async (requestParams: ICustomerAttributeListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerAttributeService.list(requestParams, token, abortController.current?.signal), 500);

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

  const handleSave = async (payload: ICustomerAttributeRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await CustomerAttributeService.update(payload, token);

    if (response?.code === 200) {
      toast.show(modal.type === "add" ? "Thêm thành công" : "Cập nhật thành công");
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

    const response = await CustomerAttributeService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const columns: ColumnDef<ICustomerAttributeResponse>[] = [
    {
      key: "name",
      title: "Tên trường",
      render: (item) => (
        <View style={{ gap: 2 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.text }}>{item.name}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textLight }}>{item.fieldName}</Text>
        </View>
      ),
    },
    {
      key: "type",
      title: "Loại dữ liệu",
      align: "right",
      render: (item) => (
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <View style={{ backgroundColor: "#e3f2fd", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontSize: 12, color: COLORS.info, fontWeight: "600" }}>{item.datatype}</Text>
          </View>
        </View>
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
        <View style={{ flex: 1 }}>
          <SearchBar
            placeholder="Tìm trường thông tin..."
            onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))}
            value={params.keyword}
          />
        </View>
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

      <ModalCustomerSetting
        shown={modalShown}
        type={modal.type}
        item={modal.item || undefined}
        onClose={() => setModalShown(false)}
        onSubmit={handleSave}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}
