import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import * as SecureStore from "expo-secure-store";
import { styles, COLORS } from "./ResourceScreen.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import ModalResource from "./partials/ModalResources";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ResourceService from "../../services/ResourceService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import { ColumnDef } from "../../components/Table/Table.types";
import type { IResourceItem } from "../../model/resource/ResourceRespondModel";
import type { IResourceListRequest, IResourceUpdateRequest } from "../../model/resource/ResourceRequestModel";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function ResourceScreen() {
  const { open } = useSidebar();
  const toast = useToast();
  const [listResources, setListResources] = useState<IResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IResourceItem | null }>({ type: null, item: null });
  const [modalShown, setModalShown] = useState(false);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [params, setParams] = useState<IResourceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("RESOURCE_VIEW");
        const valAdd = await SecureStore.getItemAsync("RESOURCE_ADD");
        const valEdit = await SecureStore.getItemAsync("RESOURCE_UPDATE");
        const valDelete = await SecureStore.getItemAsync("RESOURCE_DELETE");
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
    getListResources(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListResources = async (requestParams: IResourceListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    abortController.current = new AbortController();
    const response = await runWithDelay(() => ResourceService.list(requestParams, token, abortController.current?.signal), 500);
    if (response?.code === 200) {
      setListResources(response.result.items || []);
      pagination.updatePagination?.(response.result.total ?? 0, response.result.page ?? requestParams.page, requestParams.limit);
    } else {
      toast.show(response?.message ?? "Lỗi tải dữ liệu");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getListResources({ ...params, page: 1 }, true);
  };

  const handleSaveResource = async (payload: IResourceUpdateRequest) => {
    const token = await getToken();
    if (!token) return;

    setIsLoading(true);
    const response = await ResourceService.update(payload, token);
    setIsLoading(false);

    if (response?.code === 200) {
      toast.show(modal.type === "add" ? "Thêm tài nguyên thành công!" : "Cập nhật tài nguyên thành công!");
      setModalShown(false);
      if (modal.type === "add") {
        setParams((prev) => ({ ...prev, page: 1 }));
      } else {
        getListResources(params);
      }
    } else {
      toast.show(response?.message ?? "Thao tác thất bại. Vui lòng thử lại!");
    }
  };

  const handleDeleteResource = async () => {
    if (!modal.item) return;
    const token = await getToken();
    if (!token) return;

    setIsLoading(true);
    const response = await ResourceService.delete(modal.item.id, token);
    setIsLoading(false);

    if (response?.code === 200) {
      toast.show("Xóa tài nguyên thành công!");
      setModalShown(false);

      const safePage = params.page ?? 1;
      const newPage = listResources.length === 1 && safePage > 1 ? safePage - 1 : safePage;
      if (newPage !== safePage) {
        setParams((prev) => ({ ...prev, page: newPage }));
      } else {
        getListResources(params);
      }
    } else {
      toast.show(response?.message ?? "Xóa thất bại. Vui lòng thử lại!");
    }
  };

  const columns: ColumnDef<IResourceItem>[] = [
    {
      key: "name",
      title: "Thông tin tài nguyên",
      render: (item) => (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: "700", fontSize: 16, color: COLORS.text }}>{item.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{ fontSize: 12, color: COLORS.textGray, backgroundColor: "#f3f4f6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}
            >
              {item.code}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: "uri",
      title: "Chi tiết",
      render: (item) => (
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 14, color: COLORS.primary }} numberOfLines={1} ellipsizeMode="tail">
            {item.uri}
          </Text>
          {item.description ? (
            <Text style={{ fontSize: 14, color: COLORS.textGray }} numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </Text>
          ) : null}
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
            placeholder="Tìm kiếm tài nguyên..."
            onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))}
            value={(params.keyword as string) || ""}
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
        data={listResources}
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

      {!isLoading && listResources.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalResource
        shown={modalShown}
        type={modal.type}
        item={modal.item}
        onClose={() => setModalShown(false)}
        onSubmit={handleSaveResource}
        onDelete={handleDeleteResource}
      />
    </SafeAreaView>
  );
}
