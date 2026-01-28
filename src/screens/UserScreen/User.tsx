import React, { useState, useEffect, useRef } from "react";
import { View, Text, Switch, Image } from "react-native"; // Đã thêm Image
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "expo-toast";
import { styles, COLORS } from "./User.styles";
import Header from "../../components/Header/Header";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import AddButton from "../../components/AddButton/AddButton";
import SearchBar from "../../components/Searchbar/Searchbar";
import ModalUser from "./partials/ModalUser";
import UserService from "../../services/UserService";
import { getToken, runWithDelay } from "../../utils/common";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { usePagination } from "../../hooks/usePagination";
import type { IUser } from "../../model/user/UserResponseModel";
import type { IUserListRequest, IUserUpdateRequest } from "../../model/user/UserRequestModel";
import { ColumnDef } from "../../components/Table/Table.types";

export default function UserScreen() {
  const { open } = useSidebar();
  const toast = useToast();

  const [listUsers, setListUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modal, setModal] = useState<{ type: "add" | "edit" | "delete" | "detail" | null; item?: IUser | null }>({
    type: null,
    item: null,
  });
  const [modalShown, setModalShown] = useState(false);

  const [params, setParams] = useState<IUserListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    getListUsers(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListUsers = async (requestParams: IUserListRequest, isPull = false) => {
    if (!isPull) setIsLoading(true);
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    abortController.current = new AbortController();
    const response = await runWithDelay(() => UserService.list(requestParams, token, abortController.current?.signal), 500);

    if (response?.code === 200) {
      setListUsers(response.result.items || []);
      pagination.updatePagination?.(response.result.total ?? 0, response.result.page ?? requestParams.page, requestParams.limit);
    } else {
      toast.show(response?.message ?? "Lỗi tải dữ liệu");
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    getListUsers({ ...params, page: 1 }, true);
  };

  const handleToggleStatus = async (user: IUser) => {
    const token = await getToken();
    if (!token) return;

    const newStatus = Number(user.active) === 1 ? 0 : 1;
    const oldStatus = Number(user.active);

    setListUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, active: newStatus } : item)));

    const response = await UserService.updateStatus(String(user.id), newStatus === 1, token);

    if (response?.code === 200) {
      toast.show("Đổi trạng thái thành công");
    } else {
      toast.show("Đổi trạng thái thất bại");
      setListUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, active: oldStatus } : item)));
    }
  };

  const handleSaveUser = async (payload: IUserUpdateRequest) => {
    const token = await getToken();
    if (!token) return;

    const response = await UserService.update(payload, token);

    if (response?.code === 200) {
      toast.show(modal.type === "add" ? "Thêm mới thành công" : "Cập nhật thành công");
      setModalShown(false);
      getListUsers(params);
    } else {
      toast.show(response?.message ?? "Có lỗi xảy ra");
    }
  };

  const handleDeleteUser = async () => {
    if (!modal.item) return;
    const token = await getToken();
    if (!token) return;

    const response = await UserService.delete(String(modal.item.id), token);

    if (response?.code === 200) {
      toast.show("Xóa thành công");
      setModalShown(false);
      getListUsers(params);
    } else {
      toast.show(response?.message ?? "Xóa thất bại");
    }
  };

  const columns: ColumnDef<IUser>[] = [
    {
      key: "name",
      title: "Người dùng",
      render: (item) => (
        <View style={styles.cellUserContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
              {item.email}
            </Text>
          </View>
        </View>
      ),
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (item) => (
        <View>
          <Text style={styles.cellText}>{item.phone}</Text>
        </View>
      ),
    },
    {
      key: "active",
      title: "Trạng thái",
      render: (item) => (
        <Switch
          trackColor={{ false: "#767577", true: COLORS.primary }}
          thumbColor={COLORS.white}
          value={Number(item.active) === 1}
          onValueChange={() => handleToggleStatus(item)}
        />
      ),
      width: 80,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header onMenuPress={open} />

      <View style={styles.toolbar}>
        <SearchBar placeholder="Tìm người dùng..." onSearch={(text) => setParams((p) => ({ ...p, keyword: text, page: 1 }))} value={params.keyword} />
        <AddButton
          label="Thêm mới"
          onClick={() => {
            setModal({ type: "add" });
            setModalShown(true);
          }}
        />
      </View>

      <Table
        data={listUsers}
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

      {!isLoading && listUsers.length > 0 && (
        <Pagination
          total={pagination.totalItem}
          page={pagination.page}
          perPage={pagination.limit}
          onPageChange={pagination.setPage}
          onPerPageChange={pagination.chooseLimit}
        />
      )}

      <ModalUser
        shown={modalShown}
        type={modal.type}
        item={modal.item}
        onClose={() => setModalShown(false)}
        onSubmit={handleSaveUser}
        onDelete={handleDeleteUser}
      />
    </SafeAreaView>
  );
}
