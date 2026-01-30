import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./Service.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalService from "./partials/ModalService";
import ServiceService from "../../services/ServiceService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { IServiceResponse } from "../../model/service/ServiceResponseModel";
import type { IServiceListRequest, IServiceRequest } from "../../model/service/ServiceRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function ServiceScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listServices, setListServices] = useState<IServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IServiceResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<IServiceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("SERVICE_VIEW");
        const valAdd = await SecureStore.getItemAsync("SERVICE_ADD");
        const valEdit = await SecureStore.getItemAsync("SERVICE_UPDATE");
        const valDelete = await SecureStore.getItemAsync("SERVICE_DELETE");
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

  const getData = async (requestParams: IServiceListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => ServiceService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListServices(response.result.items || []);
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

  const handleSave = async (payload: IServiceRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await ServiceService.update(payload, token);

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

    const response = await ServiceService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const columns: ColumnDef<IServiceResponse>[] = [
    {
      key: "info",
      title: "Dịch vụ",
      render: (item) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 }}>
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random` }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ gap: 2, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.cellTextBold} numberOfLines={1}>
                {item.name}
              </Text>
              {item.featured === 1 && <Text style={{ fontSize: 12 }}>⭐</Text>}
            </View>
            <Text style={styles.cellText} numberOfLines={1}>
              {item.code}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: "price",
      title: "Giá dịch vụ",
      align: "left",
      render: (item) => (
        <View style={{ gap: 4, alignItems: "flex-start" }}>
          <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: "600" }}>{formatMoney(item.price || 0)}</Text>
        </View>
      ),
    },
    {
      key: "type",
      title: "Loại",
      align: "left",
      render: (item) => (
        <View
          style={{
            backgroundColor: item.isCombo === 1 ? "#fff3e0" : "#e0f2f1",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: item.isCombo === 1 ? "#e65100" : "#00695c",
            }}
          >
            {item.isCombo === 1 ? "Combo" : "Thường"}
          </Text>
        </View>
      ),
      width: 70,
    },
  ];

  if (canView === false) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (canView === null) {
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
          <SearchBar placeholder="Tìm dịch vụ..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
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
        data={listServices}
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

      {!isLoading && listServices.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalService
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
