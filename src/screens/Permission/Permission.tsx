import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { useRoute, RouteProp } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { styles, COLORS } from "./Permission.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import SearchBar from "../../components/Searchbar/Searchbar";
import PermissionService from "../../services/PermissionService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { ColumnDef } from "../../components/Table/Table.types";
import type { IResourcePermissionItem } from "../../model/permissions/PermissionResponseModel";
import type { IPermissionUpdateRequest } from "../../model/permissions/PermissionRequestModel";
import type { RootStackParamList } from "../../types/types";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import ModalPermission from "./partials/ModalPermission";

export default function PermissionScreen() {
  const { open } = useSidebar();
  const toast = useToast();
  const route = useRoute<RouteProp<RootStackParamList, "Permission">>();
  const roleId = route.params?.roleId;
  const roleName = route.params?.roleName || "Vai trò";
  const [listResource, setListResource] = useState<IResourcePermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalItem, setModalItem] = useState<IResourcePermissionItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("PERMISSION_VIEW");
        const valUpdate = await SecureStore.getItemAsync("PERMISSION_UPDATE");
        setCanView(valView === "1");
        setCanEdit(valUpdate === "1");
      } catch (error) {
        setCanView(false);
        setCanEdit(false);
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    if (roleId && canView) {
      getResourcePermission();
    } else if (!roleId && canView) {
    }
    return () => abortController.current?.abort();
  }, [roleId, canView]);

  const getResourcePermission = async (isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) return setIsLoading(false);

    abortController.current = new AbortController();
    const response = await runWithDelay(() => PermissionService.info({ roleId }, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListResource(response.result || []);
      setPage(1);
    } else {
      toast.show(response?.message ?? "Lỗi tải dữ liệu phân quyền");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getResourcePermission(true);
  };

  const handleToggleAction = async (action: string, checked: boolean) => {
    if (!modalItem || !canEdit) return;
    const token = await getToken();
    if (!token) return;
    updateLocalState(modalItem.id, action, checked);

    const payload: IPermissionUpdateRequest = {
      roleId,
      resourceId: modalItem.id,
      actions: JSON.stringify([action]),
    };

    const serviceFn = checked ? PermissionService.add : PermissionService.remove;
    const response = await serviceFn(payload, token);

    if (response?.code !== 200) {
      updateLocalState(modalItem.id, action, !checked);
      toast.show(response?.message ?? "Cập nhật thất bại");
    }
  };

  const handleToggleAllActions = async (checked: boolean) => {
    if (!modalItem || !canEdit) return;
    const token = await getToken();
    if (!token) return;

    let allActions: string[] = [];
    try {
      allActions = JSON.parse(modalItem.actions || "[]");
    } catch {
      allActions = [];
    }

    setListResource((prev) =>
      prev.map((r) => {
        if (r.id !== modalItem.id) return r;
        const newItem = {
          ...r,
          permission: {
            ...r.permission,
            actions: JSON.stringify(checked ? allActions : []),
          },
        };
        setModalItem(newItem);
        return newItem;
      })
    );

    const payload: IPermissionUpdateRequest = {
      roleId,
      resourceId: modalItem.id,
      actions: JSON.stringify(allActions),
    };

    const serviceFn = checked ? PermissionService.add : PermissionService.remove;
    const response = await serviceFn(payload, token);

    if (response?.code !== 200) {
      toast.show(response?.message ?? "Cập nhật thất bại");
      handleRefresh();
    }
  };

  const updateLocalState = (resourceId: number, action: string, isAdd: boolean) => {
    setListResource((prev) =>
      prev.map((r) => {
        if (r.id !== resourceId) return r;

        let currentActions: string[] = [];
        try {
          currentActions = JSON.parse(r.permission.actions || "[]");
        } catch {
          currentActions = [];
        }

        let newActions = [...currentActions];
        if (isAdd) {
          if (!newActions.includes(action)) newActions.push(action);
        } else {
          newActions = newActions.filter((a) => a !== action);
        }

        const newItem = {
          ...r,
          permission: {
            ...r.permission,
            actions: JSON.stringify(newActions),
          },
        };

        if (modalItem?.id === resourceId) {
          setModalItem(newItem);
        }
        return newItem;
      })
    );
  };

  const filteredData = listResource.filter(
    (item) => item.name.toLowerCase().includes(keyword.toLowerCase()) || item.code.toLowerCase().includes(keyword.toLowerCase())
  );

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const columns: ColumnDef<IResourcePermissionItem>[] = [
    {
      key: "name",
      title: "Tên tài nguyên",
      render: (item) => (
        <TouchableOpacity
          onPress={() => {
            setModalItem(item);
            setModalVisible(true);
          }}
        >
          <View>
            <Text style={{ fontWeight: "700", fontSize: 16, color: COLORS.text }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textGray, marginTop: 2 }}>{item.code}</Text>
          </View>
        </TouchableOpacity>
      ),
    },
    {
      key: "actions",
      title: "Quyền đã cấp",
      render: (item) => {
        let granted: string[] = [];
        try {
          granted = JSON.parse(item.permission?.actions || "[]");
        } catch {}

        return (
          <TouchableOpacity
            onPress={() => {
              setModalItem(item);
              setModalVisible(true);
            }}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {granted.length > 0 ? (
                granted.map((g, index) => (
                  <Text
                    key={index}
                    style={{
                      fontSize: 12,
                      color: COLORS.success,
                      backgroundColor: "#dcfce7",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {g}
                  </Text>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: COLORS.textGray, fontStyle: "italic" }}>(Chưa có)</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      },
    },
  ];

  if (canView === null) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        {/* <ActivityIndicator size="large" color={COLORS.primary} /> */}
        {/* Nếu chưa có component loading riêng thì dùng Text tạm */}
      </SafeAreaView>
    );
  }

  if (canView === false) {
    return (
      <SafeAreaView style={styles.container}>
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
        <Text style={styles.roleTitle} numberOfLines={1}>
          Phân quyền: {roleName}
        </Text>
      </View>

      <View style={[styles.toolbar, { borderTopWidth: 0, paddingVertical: 8 }]}>
        <SearchBar
          placeholder="Tìm tài nguyên..."
          onSearch={(text) => {
            setKeyword(text);
            setPage(1);
          }}
          value={keyword}
        />
      </View>

      <Table
        data={paginatedData}
        columns={columns}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        actions={{
          onEdit: (item) => {
            setModalItem(item);
            setModalVisible(true);
          },
        }}
      />

      {!isLoading && filteredData.length > 0 && (
        <Pagination
          total={filteredData.length}
          page={page}
          perPage={limit}
          onPageChange={setPage}
          onPerPageChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      <ModalPermission
        visible={modalVisible}
        item={modalItem}
        canEdit={!!canEdit}
        onClose={() => setModalVisible(false)}
        onToggle={handleToggleAction}
        onToggleAll={handleToggleAllActions}
      />
    </SafeAreaView>
  );
}
