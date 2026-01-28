import React, { useState, useEffect, useRef, Fragment } from "react";
import { View, Text, Switch, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { styles, COLORS } from "./Role.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import RoleModal from "./partials/ModalRole";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import RoleService from "../../services/RoleService";
import type { IRoleItem } from "../../model/role/RoleResponseModel";
import type { IRoleUpdateRequest, IRoleListRequest } from "../../model/role/RoleRequestModel";
import { usePagination } from "../../hooks/usePagination";
import { getToken, runWithDelay } from "../../utils/common";
import { ColumnDef } from "../../components/Table/Table.types";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function RolesAndPermissions() {
  const [listRoles, setListRoles] = useState<IRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IRoleItem | null }>({ type: null, item: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<IRoleListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [canPermission, setCanPermission] = useState<boolean | null>(null);

  const toast = useToast();
  const navigation = useNavigation();
  const { open } = useSidebar();
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("ROLE_VIEW");
        const valAdd = await SecureStore.getItemAsync("ROLE_ADD");
        const valDelete = await SecureStore.getItemAsync("ROLE_DELETE");
        const valEdit = await SecureStore.getItemAsync("ROLE_UPDATE");
        const valPermission = await SecureStore.getItemAsync("PERMISSION_VIEW");

        setCanView(valView === "1");
        setCanAdd(valAdd === "1");
        setCanDelete(valDelete === "1");
        setCanEdit(valEdit === "1");
        setCanPermission(valPermission === "1");
      } catch (error) {
        setCanView(false);
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    if (canView) {
      getListRoles(params);
    }
    return () => abortController.current?.abort();
  }, [params, canView]);

  const getListRoles = async (paramsSearch: IRoleListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);

    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => RoleService.list(paramsSearch, token, abortController.current?.signal), 500);

    if (response && response.code === 200) {
      const result = response.result;
      setListRoles(result.items || []);
      pagination.updatePagination?.(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      toast.show(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau");
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getListRoles({ ...params, page: 1 }, true);
  };

  const handleAddRole = async (payload: IRoleUpdateRequest) => {
    setIsLoading(true);
    const token = await getToken();
    const response = await RoleService.update(payload, token);

    if (response && response.code === 200) {
      toast.show("Thêm vai trò thành công!");
      setModalShown(false);
      setModal({ type: null });
      setParams((prev) => ({ ...prev, page: 1 }));
    } else {
      toast.show(response?.message ?? "Thêm vai trò thất bại. Vui lòng thử lại!");
    }
    setIsLoading(false);
  };

  const handleEditRole = async (payload: IRoleUpdateRequest) => {
    setIsLoading(true);
    const token = await getToken();
    const response = await RoleService.update(payload, token);

    if (response && response.code === 200) {
      toast.show("Cập nhật vai trò thành công!");
      setModalShown(false);
      setModal({ type: null });
      await getListRoles(params);
    } else {
      toast.show(response?.message ?? "Cập nhật vai trò thất bại. Vui lòng thử lại!");
    }
    setIsLoading(false);
  };

  const handleDeleteRole = async () => {
    if (!modal.item) return;
    setIsLoading(true);
    const token = await getToken();
    const roleItem = modal.item as IRoleItem;

    const response = await RoleService.delete(roleItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listRoles.length === 1 && safePage > 1 ? safePage - 1 : safePage;

    if (response && response.code === 200) {
      toast.show("Xóa vai trò thành công!");
      setModalShown(false);
      setModal({ type: null });
      setParams((prev) => ({ ...prev, page: newPage }));
    } else {
      toast.show(response?.message ?? "Xóa vai trò thất bại. Vui lòng thử lại!");
    }
    setIsLoading(false);
  };

  const handleTogglePermission = async (role: IRoleItem, field: "isDefault" | "isOperator", value: boolean) => {
    const token = await getToken();
    setUpdatingIds((prev) => [...prev, role.id]);

    const payload: IRoleUpdateRequest = {
      id: role.id,
      name: role.name,
      isDefault: field === "isDefault" ? (value ? 1 : 0) : role.isDefault,
      isOperator: field === "isOperator" ? (value ? 1 : 0) : role.isOperator,
    };

    const response = await RoleService.update(payload, token);
    if (response && response.code === 200) {
      setListRoles((prev) =>
        prev.map((r) => {
          if (r.id === role.id) return { ...r, [field]: payload[field] };
          if (field === "isDefault" && payload.isDefault === 1 && r.id !== role.id) return { ...r, isDefault: 0 };
          return r;
        })
      );
      toast.show("Cập nhật quyền thành công!");
    } else {
      toast.show(response?.message ?? "Cập nhật quyền thất bại. Vui lòng thử lại!");
    }
    setUpdatingIds((prev) => prev.filter((id) => id !== role.id));
  };

  const columns: ColumnDef<IRoleItem>[] = [
    {
      key: "name",
      title: "Vai trò",
      render: (row) => <Text style={{ fontWeight: "700", color: "#333" }}>{row.name}</Text>,
      width: 120,
    },
    {
      key: "isDefault",
      title: "Mặc định",
      render: (row) => (
        <Switch
          trackColor={{ false: "#767577", true: COLORS.primary }}
          thumbColor={COLORS.white}
          value={Number(row.isDefault) === 1}
          onValueChange={(val) => handleTogglePermission(row, "isDefault", val)}
          disabled={updatingIds.includes(row.id)}
        />
      ),
      align: "center",
    },
    {
      key: "isOperator",
      title: "Điều hành",
      render: (row) => (
        <Switch
          trackColor={{ false: "#767577", true: COLORS.primary }}
          thumbColor={COLORS.white}
          value={Number(row.isOperator) === 1}
          onValueChange={(val) => handleTogglePermission(row, "isOperator", val)}
          disabled={updatingIds.includes(row.id)}
        />
      ),
      align: "center",
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
        <SearchBar
          placeholder="Tìm kiếm vai trò..."
          onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))}
          value={params.keyword}
        />

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

      <View style={{ flex: 1 }}>
        {!isLoading && listRoles.length > 0 ? (
          <Table
            data={listRoles}
            columns={columns}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            actions={{
              label: "Thao tác",
              onEdit: canEdit
                ? (row) => {
                    setModal({ type: "edit", item: row });
                    setModalShown(true);
                  }
                : undefined,
              onDelete: canDelete
                ? (row) => {
                    setModal({ type: "delete", item: row });
                    setModalShown(true);
                  }
                : undefined,
              onView: canView
                ? (item) => {
                    setModal({ type: "detail", item });
                    setModalShown(true);
                  }
                : undefined,
              onPermission: canPermission
                ? (row) => {
                    (navigation as any).navigate("Permission", {
                      roleId: row.id,
                      roleName: row.name,
                    });
                  }
                : undefined,
            }}
          />
        ) : isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <Fragment>
            {isNoItem ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <Text style={{ textAlign: "center", color: COLORS.textGray }}>
                  Hiện tại chưa có vai trò nào.{"\n"}Hãy thêm mới vai trò đầu tiên nhé!
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
                <Text style={{ textAlign: "center", color: COLORS.textGray }}>
                  Không có dữ liệu trùng khớp.{"\n"}Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                </Text>
              </View>
            )}
          </Fragment>
        )}
      </View>

      {!isLoading && !isNoItem && listRoles.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <RoleModal
        shown={modalShown}
        type={modal.type as any}
        item={modal.item}
        onClose={() => setModalShown(false)}
        onSubmit={modal.type === "add" ? handleAddRole : handleEditRole}
        onDelete={handleDeleteRole}
      />
    </SafeAreaView>
  );
}
