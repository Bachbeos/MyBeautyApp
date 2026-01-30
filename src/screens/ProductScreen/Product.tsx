import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./Product.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalProduct from "./partials/ModalProduct";
import ProductService from "../../services/ProductService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { IProductResponse } from "../../model/product/ProductResponseModel";
import type { IProductListRequest, IProductRequest } from "../../model/product/ProductRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function ProductScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listProduct, setListProduct] = useState<IProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IProductResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<IProductListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("PRODUCT_VIEW");
        const valAdd = await SecureStore.getItemAsync("PRODUCT_ADD");
        const valEdit = await SecureStore.getItemAsync("PRODUCT_UPDATE");
        const valDelete = await SecureStore.getItemAsync("PRODUCT_DELETE");
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

  const getData = async (requestParams: IProductListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => ProductService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListProduct(response.result.items || []);
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

  const handleSave = async (payload: IProductRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await ProductService.update(payload, token);

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

    const response = await ProductService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const handleToggleStatus = async (item: IProductResponse) => {
    const token = await getToken();
    if (!token) return;

    const newStatus = Number(item.status) === 1 ? 0 : 1;

    setListProduct((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
    const payload: any = { ...item, status: newStatus };

    const response = await ProductService.update(payload, token);

    if (response?.code !== 200) {
      toast.show("Đổi trạng thái thất bại");
      setListProduct((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: Number(item.status) } : i)));
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const columns: ColumnDef<IProductResponse>[] = [
    {
      key: "info",
      title: "Sản phẩm",
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
          <View style={{ flex: 1 }}>
            <Text style={styles.cellTextBold} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cellText} numberOfLines={1}>
              {item.code}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: "details",
      title: "Giá sản phẩm",
      align: "left",
      render: (item) => (
        <View style={{ gap: 4, alignItems: "flex-start" }}>
          <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: "600" }}>{formatMoney(item.price || 0)}</Text>
          {item.discount && item.discount > 0 ? (
            <Text style={{ fontSize: 12, color: COLORS.success }}>
              Giảm: {item.discount}
              {item.discountUnit === 1 ? "%" : "đ"}
            </Text>
          ) : null}
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
      width: 60,
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
          <SearchBar placeholder="Tìm sản phẩm..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
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
        data={listProduct}
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

      {!isLoading && listProduct.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalProduct
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
