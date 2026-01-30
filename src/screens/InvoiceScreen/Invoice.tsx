import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./Invoice.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalInvoice from "./partials/ModalInvoice";
import InvoiceService from "../../services/InvoiceService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { IInvoiceResponse } from "../../model/invoice/InvoiceResponseModel";
import type { IInvoiceListRequest, IInvoiceRequest } from "../../model/invoice/InvoiceRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";

export default function InvoiceScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listInvoice, setListInvoice] = useState<IInvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IInvoiceResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<IInvoiceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    getData(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getData = async (requestParams: IInvoiceListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => InvoiceService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListInvoice(response.result.items || []);
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

  const handleSave = async (payload: IInvoiceRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await InvoiceService.update(payload, token);

    if (response?.code === 200) {
      toast.show(modal.type === "add" ? "Tạo hóa đơn thành công" : "Cập nhật thành công");
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

    const response = await InvoiceService.delete(Number(modal.item.id), token);

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

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  const columns: ColumnDef<IInvoiceResponse>[] = [
    {
      key: "info",
      title: "Mã & Khách hàng",
      render: (item) => (
        <View style={{ gap: 2 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.primary }}>#{item.invoiceCode}</Text>
          <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: "600" }}>{item.customerName || "Khách lẻ"}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textGray }}>{formatDate(item.createdTime || item.receiptDate)}</Text>
        </View>
      ),
    },
    {
      key: "amount",
      title: "Tổng tiền",
      align: "right",
      render: (item) => (
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ fontSize: 15, color: COLORS.text, fontWeight: "700" }}>{formatMoney(item.fee || 0)}</Text>
          {/* Badge Status */}
          <View
            style={{
              backgroundColor: item.status === 1 ? "#e8f5e9" : "#fff3e0",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "600", color: item.status === 1 ? "#2e7d32" : "#ef6c00" }}>
              {item.status === 1 ? "Hoàn thành" : "Nháp"}
            </Text>
          </View>
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={open} />

      <View style={styles.toolbar}>
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="Tìm hóa đơn..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
        </View>
        <AddButton
          label="Tạo HĐ"
          onClick={() => {
            setModal({ type: "add" });
            setModalShown(true);
          }}
        />
      </View>

      <Table
        data={listInvoice}
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

      {!isLoading && listInvoice.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalInvoice
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
