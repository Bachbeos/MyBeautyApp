import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "./HistoryCall.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalHistoryCall from "./partials/ModalHistoryCall";
import CallHistoryService from "../../services/CallHistoryService";
import UserService from "../../services/UserService";
import CustomerService from "../../services/CustomerService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { ICallHistoryResponse } from "../../model/historyCall/HistoryCallResponseModel";
import type { ICallHistoryListRequest, ICallHistoryRequest } from "../../model/historyCall/HistoryCallRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function CallHistoryScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listData, setListData] = useState<ICallHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [customerMap, setCustomerMap] = useState<Record<number, string>>({});

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: ICallHistoryResponse | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<ICallHistoryListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("CALL_HISTORY_VIEW");
        const valAdd = await SecureStore.getItemAsync("CALL_HISTORY_ADD");
        const valEdit = await SecureStore.getItemAsync("CALL_HISTORY_UPDATE");
        const valDelete = await SecureStore.getItemAsync("CALL_HISTORY_DELETE");
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
    const fetchReferenceData = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const [userRes, customerRes] = await Promise.all([
          UserService.list({ page: 1, limit: 1000 }, token),
          CustomerService.list({ page: 1, limit: 1000 }, token),
        ]);

        if (userRes?.code === 200) {
          const map: Record<number, string> = {};
          (userRes.result.items || []).forEach((u: any) => {
            map[u.id] = u.fullname || u.fullName || u.name || u.username || u.email || `User ${u.id}`;
          });
          setUserMap(map);
        }
        if (customerRes?.code === 200) {
          const map: Record<number, string> = {};
          (customerRes.result.items || []).forEach((c: any) => {
            map[c.id] = c.name || c.fullname || c.phone || `Customer ${c.id}`;
          });
          setCustomerMap(map);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReferenceData();
  }, []);

  useEffect(() => {
    getData(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getData = async (requestParams: ICallHistoryListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => CallHistoryService.list(requestParams, token, abortController.current?.signal), 500);

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

  const handleSave = async (payload: ICallHistoryRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await CallHistoryService.update(payload, token);

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
    const response = await CallHistoryService.delete(Number(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công vĩnh viễn!");
      setModalShown(false);
      getData(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const columns: ColumnDef<ICallHistoryResponse>[] = [
    {
      key: "type",
      title: "Loại",
      width: 60,
      render: (item) => (
        <View style={{ alignItems: "center" }}>
          <Ionicons name={item.callType === 1 ? "call" : "videocam"} size={20} color={COLORS.primary} />
        </View>
      ),
    },
    {
      key: "participants",
      title: "Người tham gia",
      align: "left",
      render: (item) => (
        <View>
          <View style={styles.cellUser}>
            <Ionicons name="person-circle-outline" size={16} color={COLORS.textGray} style={{ marginRight: 4 }} />
            <Text style={styles.cellTextSub}>{userMap[item.userId] || item.userName || `ID: ${item.userId}`}</Text>
          </View>
          <View style={styles.cellUser}>
            <Ionicons name="person-outline" size={16} color={COLORS.textGray} style={{ marginRight: 4 }} />
            <Text style={styles.cellTextSub}>{customerMap[item.customerId] || item.customerName || `ID: ${item.customerId}`}</Text>
          </View>
        </View>
      ),
    },
    {
      key: "outcome",
      title: "Kết quả",
      align: "left",
      width: 100,
      render: (item) => {
        let label = "Unknown";
        let style = styles.badgeInfo;
        let textStyle = styles.badgeTextInfo;

        if (item.outcome === 1) {
          label = "Gọi đến";
          style = styles.badgeSuccess;
          textStyle = styles.badgeTextSuccess;
        } else if (item.outcome === 2) {
          label = "Gọi đi";
          style = styles.badgeInfo;
          textStyle = styles.badgeTextInfo;
        } else if (item.outcome === 3) {
          label = "Gọi nhỡ";
          style = styles.badgeDanger;
          textStyle = styles.badgeTextDanger;
        }

        return (
          <View style={[styles.badge, style]}>
            <Text style={textStyle}>{label}</Text>
          </View>
        );
      },
    },
    {
      key: "duration",
      title: "Thời gian",
      align: "left",
      width: 80,
      render: (item) => <Text style={{ fontFamily: "monospace" }}>{formatDuration(item.duration)}</Text>,
    },
    {
      key: "rating",
      title: "Đánh giá",
      width: 80,
      align: "left",
      render: (item) =>
        item.outcome === 3 ? (
          <Text style={{ color: COLORS.textGray }}>-</Text>
        ) : (
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="star" size={14} color="#ffc107" />
            <Text style={{ fontSize: 12, marginLeft: 2 }}>{item.interestLevel}</Text>
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
            placeholder="Tìm lịch sử gọi..."
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

      <ModalHistoryCall
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
