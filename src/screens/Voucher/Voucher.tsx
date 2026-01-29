import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "./Voucher.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalVoucher from "./partials/ModalVoucher";
import VoucherService from "../../services/VoucherService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { IVoucherResponse } from "../../model/voucher/VoucherResponseModel";
import type { IVoucherListRequest, IVoucherRequest } from "../../model/voucher/VoucherRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function VoucherScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listVouchers, setListVouchers] = useState<IVoucherResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IVoucherResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<IVoucherListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("VOUCHER_VIEW");
        const valAdd = await SecureStore.getItemAsync("VOUCHER_ADD");
        const valEdit = await SecureStore.getItemAsync("VOUCHER_UPDATE");
        const valDelete = await SecureStore.getItemAsync("VOUCHER_DELETE");
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

  const getData = async (requestParams: IVoucherListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => VoucherService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListVouchers(response.result.items || []);
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

  const handleSave = async (payload: IVoucherRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await VoucherService.update(payload, token);

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

    const response = await VoucherService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const handleToggleStatus = async (item: IVoucherResponse) => {
    const token = await getToken();
    if (!token) return;

    const newStatus = Number(item.status) === 1 ? 0 : 1;
    const oldStatus = Number(item.status);

    setListVouchers((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));

    const payload: IVoucherRequest = {
      id: item.id,
      code: item.code,
      name: item.name,
      discountType: item.discountType,
      discountValue: item.discountValue,
      startDate: item.startDate,
      endDate: item.endDate,
      status: newStatus,
      totalQuantity: item.totalQuantity,
      usageQuantity: item.usageQuantity,
      perUserLimit: item.perUserLimit,
      minInvoiceAmount: item.minInvoiceAmount || 0,
    };

    const response = await VoucherService.update(payload, token);

    if (response?.code === 200) {
      toast.show("Đổi trạng thái thành công");
    } else {
      toast.show("Đổi trạng thái thất bại");
      setListVouchers((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: oldStatus } : i)));
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnDef<IVoucherResponse>[] = [
    {
      key: "name",
      title: "Mã Voucher",
      render: (item) => (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                backgroundColor: "#f8f9fa",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#e9ecef",
                borderStyle: "dashed",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.primary }}>{item.code}</Text>
            </View>
          </View>
        </View>
      ),
    },
    {
      key: "voucher",
      title: "Tên Voucher",
      align: "left",
      render: (item) => (
        <View>
          <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}>{item.name}</Text>
        </View>
      ),
    },
    {
      key: "details",
      title: "Chi tiết thông tin",
      align: "left",
      render: (item) => (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="pricetag" size={14} color={COLORS.primary} />
            <Text style={{ fontSize: 14, color: COLORS.textGray, flexShrink: 1 }}>
              Giảm:{" "}
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                {item.discountType === 1 ? formatMoney(item.discountValue) : `${item.discountValue}%`}
              </Text>
              {item.discountType === 2 && item.maxDiscount && item.maxDiscount > 0 ? (
                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>{` (Max ${formatMoney(item.maxDiscount)})`}</Text>
              ) : null}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="people-outline" size={14} color={COLORS.textGray} />
            <Text style={{ fontSize: 14, color: COLORS.textGray }}>
              Đã dùng: <Text style={{ color: COLORS.success, fontWeight: "700" }}>{item.usageQuantity}</Text>/{item.totalQuantity}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textGray} />
            <Text style={{ fontSize: 14, color: COLORS.textLight }}>{formatDate(item.endDate)}</Text>
          </View>
        </View>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
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
          <SearchBar placeholder="Tìm voucher..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
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
        data={listVouchers}
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

      {!isLoading && listVouchers.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalVoucher
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
