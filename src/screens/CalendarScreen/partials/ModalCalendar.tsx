/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { styles, COLORS } from "../Calendar.styles";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";

import type { IScheduleResponse } from "../../../model/schedule/ScheduleResponseModel";
import type { IScheduleRequest } from "../../../model/schedule/ScheduleRequestModel";
import DatePickerCustom from "../../../components/DatePicker/DatePickerCustom";

interface ModalProps {
  type: "add" | "edit" | "delete" | "detail" | null;
  shown: boolean;
  item?: IScheduleResponse;
  initialDate?: { start: Date; end: Date };
  customerOptions: any[];
  userOptions: any[];
  onClose: () => void;
  onSubmit: (payload: IScheduleRequest) => Promise<void>;
  onDelete: () => Promise<void>;
  // Thêm prop này để chuyển sang màn hình xóa
  onSwitchToDelete?: () => void;
}

const TYPE_OPTIONS = [
  { id: 1, name: "Lịch thực hiện dịch vụ" },
  { id: 2, name: "Lịch tư vấn" },
  { id: 3, name: "Họp nội bộ" },
];

export default function ModalCalendar({
  type,
  shown,
  item,
  initialDate,
  customerOptions,
  userOptions,
  onClose,
  onSubmit,
  onDelete,
  onSwitchToDelete,
}: ModalProps) {
  const [loading, setLoading] = useState(false);
  const isDeleteMode = type === "delete";
  const isDetailMode = type === "detail";
  const isViewOnly = isDetailMode;

  // Form State
  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState(1);
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // State quản lý thời gian
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (shown) {
      if (type === "add") {
        resetForm();
        if (initialDate) {
          setStartDate(initialDate.start);
          setEndDate(initialDate.end);
        } else {
          const now = new Date();
          setStartDate(now);
          setEndDate(dayjs(now).add(1, "hour").toDate());
        }
      } else if ((type === "edit" || type === "detail" || type === "delete") && item) {
        fillForm(item);
      }
    }
  }, [shown, type, item, initialDate]);

  const resetForm = () => {
    setTitle("");
    setScheduleType(1);
    setContent("");
    setNote("");
    setCustomerId(undefined);
    setUserId(undefined);
  };

  const fillForm = (data: IScheduleResponse) => {
    setTitle(data.title || "");
    setScheduleType(data.type || 1);
    setContent(data.content || "");
    setNote(data.note || "");
    setCustomerId(data.customerId);
    setUserId(data.userId);
    setStartDate(new Date(data.startTime));
    setEndDate(new Date(data.endTime));
  };

  const handleSubmit = async () => {
    if (type === "delete") {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề!");
      return;
    }

    setLoading(true);

    // LOGIC +7 TIẾNG
    const submitStartTime = dayjs(startDate).add(7, "hour").toISOString();
    const submitEndTime = dayjs(endDate).add(7, "hour").toISOString();

    const payload: IScheduleRequest = {
      id: type === "edit" && item ? Number(item.id) : 0,
      title,
      type: scheduleType,
      content,
      note,
      customerId: scheduleType !== 3 ? customerId : undefined,
      userId: scheduleType !== 3 ? userId : undefined,
      startTime: submitStartTime,
      endTime: submitEndTime,
    };

    await onSubmit(payload);
    setLoading(false);
  };

  const renderLabel = (text: string, required = false) => (
    <Text style={styles.label}>
      {text} {required && <Text style={{ color: COLORS.danger }}>*</Text>}
    </Text>
  );

  if (!type) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={shown} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            {/* --- HEADER --- */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {type === "add" ? "Thêm lịch hẹn" : type === "edit" ? "Cập nhật lịch hẹn" : isDeleteMode ? "Xóa lịch hẹn" : "Chi tiết lịch"}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            {/* --- BODY --- */}
            {isDeleteMode ? (
              <View style={styles.deleteContainer}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#fee2e2",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="trash-outline" size={32} color={COLORS.danger} />
                </View>
                <Text style={styles.confirmText}>
                  Bạn có chắc muốn xóa lịch hẹn <Text style={{ fontWeight: "bold" }}>{item?.title}</Text>?
                </Text>
                <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  {renderLabel("Tiêu đề", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nhập tiêu đề..."
                    placeholderTextColor={COLORS.textGray}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Loại lịch", true)}
                  <SelectCustom
                    options={TYPE_OPTIONS}
                    value={scheduleType}
                    onChange={(opt) => setScheduleType(Number(opt.id))}
                    placeholder="Chọn loại"
                    disabled={isViewOnly}
                  />
                </View>

                {/* Ẩn hiện Customer/User theo loại lịch */}
                {scheduleType !== 3 && (
                  <>
                    {/* Khách hàng */}
                    <View style={styles.formGroup}>
                      {renderLabel("Khách hàng")}
                      <SelectCustom
                        options={customerOptions}
                        value={customerId}
                        onChange={(opt: any) => setCustomerId(Number(opt.id))}
                        placeholder="Chọn khách hàng"
                        disabled={isViewOnly}
                      />
                    </View>

                    {/* Nhân viên */}
                    <View style={styles.formGroup}>
                      {renderLabel("Nhân viên")}
                      <SelectCustom
                        options={userOptions}
                        value={userId}
                        onChange={(opt: any) => setUserId(Number(opt.id))}
                        placeholder="Chọn nhân viên"
                        disabled={isViewOnly}
                      />
                    </View>
                  </>
                )}

                <View style={[{ marginTop: scheduleType !== 3 ? 16 : 0 }]}>
                  <>
                    <View style={styles.formGroup}>
                      <DatePickerCustom
                        label="Ngày bắt đầu"
                        value={startDate}
                        onConfirm={setStartDate}
                        mode="datetime"
                        required
                        disabled={isViewOnly}
                      />
                    </View>
                    <View style={styles.formGroup}>
                      <DatePickerCustom label="Ngày kết thúc" value={endDate} onConfirm={setEndDate} mode="datetime" required disabled={isViewOnly} />
                    </View>
                  </>
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Nội dung")}
                  <TextInput
                    style={[styles.input, styles.textArea, isViewOnly && styles.inputDisabled]}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    placeholder="Nhập nội dung..."
                    placeholderTextColor={COLORS.textGray}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Ghi chú")}
                  <TextInput
                    style={[styles.input, styles.textArea, isViewOnly && styles.inputDisabled]}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    placeholder="Ghi chú thêm..."
                    placeholderTextColor={COLORS.textGray}
                    editable={!isViewOnly}
                  />
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            {/* --- FOOTER --- */}
            <View style={styles.modalFooter}>
              {/* NÚT XÓA: Chỉ hiện khi đang Edit */}
              {!isDeleteMode && type === "edit" && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonDelete, { marginRight: "auto", minWidth: 50, paddingHorizontal: 12 }]}
                  onPress={onSwitchToDelete}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                <Text style={[styles.textStyle, { color: COLORS.text }]}>{isDetailMode ? "Đóng" : "Hủy"}</Text>
              </TouchableOpacity>

              {!isDetailMode && (
                <TouchableOpacity
                  style={[styles.button, isDeleteMode ? styles.buttonDelete : styles.buttonSave]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.textStyle}>{isDeleteMode ? "Đồng ý xóa" : type === "add" ? "Tạo mới" : "Lưu thay đổi"}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
