import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./Customer.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalCustomer from "./partials/ModalCustomer";
import CustomerService from "../../services/CustomerService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { ICustomerResponse } from "../../model/customer/CustomerResponseModel";
import type { ICustomerListRequest, ICustomerRequest } from "../../model/customer/CustomerRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function CustomerScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listData, setListData] = useState<ICustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: ICustomerResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<ICustomerListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("CUSTOMER_VIEW");
        const valAdd = await SecureStore.getItemAsync("CUSTOMER_ADD");
        const valEdit = await SecureStore.getItemAsync("CUSTOMER_UPDATE");
        const valDelete = await SecureStore.getItemAsync("CUSTOMER_DELETE");
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

  const getData = async (requestParams: ICustomerListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerService.list(requestParams, token, abortController.current?.signal), 500);

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

  const handleSave = async (payload: ICustomerRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await CustomerService.update(payload, token);

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

    const response = await CustomerService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const columns: ColumnDef<ICustomerResponse>[] = [
    {
      key: "info",
      title: "Khách hàng",
      render: (item) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 }}>
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random` }}
              style={styles.listAvatar}
            />
          ) : (
            <View style={styles.listAvatar}>
              <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ gap: 2, flex: 1 }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.text }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textGray }}>{item.email || "Không có email"}</Text>
          </View>
        </View>
      ),
    },
    {
      key: "phone",
      title: "Số điện thoại",
      width: 100,
      render: (item) => (
        <Text style={{ fontSize: 13, color: COLORS.textLight }} numberOfLines={1}>
          {item.phone || "-"}
        </Text>
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
            placeholder="Tìm khách hàng..."
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

      <ModalCustomer
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
