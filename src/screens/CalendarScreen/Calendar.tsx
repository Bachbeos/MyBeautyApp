/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "expo-toast";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Calendar } from "react-native-big-calendar";
import { useFocusEffect } from "@react-navigation/native";
import { styles, COLORS } from "./Calendar.styles";
import Header from "../../components/Header/Header";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import ModalCalendar from "./partials/ModalCalendar";
import ScheduleService from "../../services/ScheduleService";
import CustomerService from "../../services/CustomerService";
import UserService from "../../services/UserService";
import { getToken } from "../../utils/common";
import type { IScheduleResponse } from "../../model/schedule/ScheduleResponseModel";
import type { IScheduleRequest } from "../../model/schedule/ScheduleRequestModel";
import * as SecureStore from "expo-secure-store";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

dayjs.locale("vi");

export default function CalendarScreen() {
  const { open } = useSidebar();
  const toast = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [mode, setMode] = useState<"day" | "3days" | "week">("3days");
  const [date, setDate] = useState(dayjs());
  const [isLoading, setIsLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [modal, setModal] = useState<{
    type: "add" | "edit" | "delete" | "detail" | null;
    item?: IScheduleResponse;
    initialDate?: { start: Date; end: Date };
  }>({ type: null });
  const [modalShown, setModalShown] = useState(false);

  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const valView = await SecureStore.getItemAsync("SCHEDULE_VIEW");
        const valAdd = await SecureStore.getItemAsync("SCHEDULE_ADD");
        const valEdit = await SecureStore.getItemAsync("SCHEDULE_UPDATE");
        const valDelete = await SecureStore.getItemAsync("SCHEDULE_DELETE");
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
    fetchMasterData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const fetchMasterData = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [cusRes, userRes] = await Promise.all([
        CustomerService.list({ page: 1, limit: 1000 }, token),
        UserService.list({ page: 1, limit: 1000 }, token),
      ]);
      if (cusRes?.code === 200) setCustomerOptions(cusRes.result.items || []);
      if (userRes?.code === 200) setUserOptions(userRes.result.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchedules = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await ScheduleService.list({ page: 1, limit: 1000 }, token);
      if (res?.code === 200) {
        const rawItems = res.result.items || [];
        const mappedEvents = rawItems.map((item: IScheduleResponse) => {
          const startObj = new Date(item.startTime);
          const endObj = new Date(item.endTime);
          return {
            id: item.id,
            title: item.title,
            start: startObj,
            end: endObj,
            color: item.type === 1 ? COLORS.success : item.type === 2 ? COLORS.warning : COLORS.info,
            originalItem: item,
          };
        });
        setEvents([...mappedEvents]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (payload: IScheduleRequest) => {
    if (!canAdd) return;
    const token = await getToken();
    if (!token) return;
    const res = await ScheduleService.update(payload, token);
    if (res?.code === 200) {
      toast.show("Tạo lịch thành công!");
      setModalShown(false);
      fetchSchedules();
    } else {
      toast.show(res?.message || "Lỗi khi tạo");
    }
  };

  const handleEdit = async (payload: IScheduleRequest) => {
    if (!canEdit) return;
    const token = await getToken();
    if (!token) return;
    const res = await ScheduleService.update(payload, token);
    if (res?.code === 200) {
      toast.show("Cập nhật thành công!");
      setModalShown(false);
      fetchSchedules();
    } else {
      toast.show(res?.message || "Lỗi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    if (!modal.item) return;
    const token = await getToken();
    if (!token) return;
    const res = await ScheduleService.delete(Number(modal.item.id), token);
    if (res?.code === 200) {
      toast.show("Đã xóa lịch hẹn");
      setModalShown(false);
      fetchSchedules();
    } else {
      toast.show("Lỗi khi xóa");
    }
  };

  const onLongPressCell = (date: Date) => {
    if (!canAdd) return;
    const start = date;
    const end = dayjs(date).add(1, "hour").toDate();
    setModal({ type: "add", initialDate: { start, end } });
    setModalShown(true);
  };

  const onPressEvent = (event: any) => {
    const targetType = canEdit ? "edit" : "detail";
    setModal({ type: targetType, item: event.originalItem });
    setModalShown(true);
  };

  const onFabPress = () => {
    if (!canAdd) return;
    const start = new Date();
    start.setMinutes(0, 0, 0);
    const end = dayjs(start).add(1, "hour").toDate();
    setModal({ type: "add", initialDate: { start, end } });
    setModalShown(true);
  };

  const changeDate = (num: number) => {
    const newDate = date.add(num, mode === "week" ? "week" : "day");
    setDate(newDate);
  };

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
        <View style={styles.navGroup}>
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.dateTitle}>{date.format("MM/YYYY")}</Text>
          <TouchableOpacity onPress={() => changeDate(1)}>
            <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.navGroup}>
          <TouchableOpacity style={[styles.viewModeBtn, mode === "day" && styles.viewModeBtnActive]} onPress={() => setMode("day")}>
            <Text style={[styles.viewModeText, mode === "day" && styles.viewModeTextActive]}>Ngày</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.viewModeBtn, mode === "3days" && styles.viewModeBtnActive]} onPress={() => setMode("3days")}>
            <Text style={[styles.viewModeText, mode === "3days" && styles.viewModeTextActive]}>3 Ngày</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <Calendar
          events={events}
          height={600}
          mode={mode}
          date={date.toDate()}
          onLongPressCell={onLongPressCell}
          onPressEvent={onPressEvent}
          swipeEnabled={true}
          hourRowHeight={50}
          activeDate={new Date()}
          locale="vi"
        />
      )}

      {canAdd && (
        <TouchableOpacity style={styles.fab} onPress={onFabPress}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      <ModalCalendar
        shown={modalShown}
        type={modal.type}
        item={modal.item}
        initialDate={modal.initialDate}
        customerOptions={customerOptions}
        userOptions={userOptions}
        onClose={() => setModalShown(false)}
        onSubmit={modal.type === "add" ? handleAdd : handleEdit}
        onDelete={handleDelete}
        onSwitchToDelete={canDelete ? () => setModal({ ...modal, type: "delete" }) : undefined}
      />
    </SafeAreaView>
  );
}
