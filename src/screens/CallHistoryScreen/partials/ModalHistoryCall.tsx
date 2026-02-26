/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "expo-toast";
import { styles, COLORS } from "../HistoryCall.styles";

import UserService from "../../../services/UserService";
import CustomerService from "../../../services/CustomerService";
import { getToken } from "../../../utils/common";

import SelectCustom from "../../../components/SelectCustom/SelectCustom";

import type { ICallHistoryRequest } from "../../../model/historyCall/HistoryCallRequestModel";
import type { ICallHistoryResponse } from "../../../model/historyCall/HistoryCallResponseModel";

type ModalType = "add" | "edit" | "delete" | "detail" | null;

interface ModalProps {
  type: ModalType;
  shown: boolean;
  item?: ICallHistoryResponse;
  onClose: () => void;
  onSubmit: (payload: ICallHistoryRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ModalHistoryCall({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const toast = useToast();
  const isDetail = type === "detail";
  const [loading, setLoading] = useState(false);

  // --- FORM STATES ---
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [callType, setCallType] = useState<number>(1);
  const [outcome, setOutcome] = useState<number>(1);
  const [duration, setDuration] = useState<string>("0");
  const [interestLevel, setInterestLevel] = useState<number>(3);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<number>(1);

  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);

  const outcomeOptions = [
    { id: 1, name: "Gọi đến" },
    { id: 2, name: "Gọi đi" },
    { id: 3, name: "Gọi nhỡ" },
  ];

  // --- INIT DATA ---
  useEffect(() => {
    if ((type === "add" || type === "edit") && shown) {
      fetchOptions();
    }
  }, [type, shown]);

  useEffect(() => {
    if (shown) {
      if (type === "add") {
        resetForm();
      } else if ((type === "edit" || type === "detail") && item) {
        fillForm(item);
      }
    }
  }, [shown, type, item]);

  useEffect(() => {
    if (outcome === 3) {
      setDuration("0");
    }
  }, [outcome]);

  const fetchOptions = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [userRes, customerRes] = await Promise.all([
        UserService.list({ page: 1, limit: 1000 }, token),
        CustomerService.list({ page: 1, limit: 1000 }, token),
      ]);

      if (userRes?.code === 200) {
        setUserOptions(
          (userRes.result.items || []).map((u: any) => ({
            id: u.id,
            name: u.fullname || u.fullName || u.name || u.username || u.email || `User ${u.id}`,
          }))
        );
      }

      if (customerRes?.code === 200) {
        setCustomerOptions(
          (customerRes.result.items || []).map((c: any) => ({
            id: c.id,
            name: c.name || c.fullname || c.phone || `Customer ${c.id}`,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setSelectedCustomer(null);
    setCallType(1);
    setOutcome(1);
    setDuration("0");
    setInterestLevel(3);
    setNote("");
    setStatus(1);
  };

  const fillForm = (data: ICallHistoryResponse) => {
    setSelectedUser({ id: data.userId, name: data.userName });
    setSelectedCustomer({ id: data.customerId, name: data.customerName });

    setCallType(data.callType);
    setOutcome(data.outcome);
    setDuration(String(data.duration));
    setInterestLevel(data.interestLevel);
    setNote(data.note || "");
    setStatus(data.status);
  };

  const handleSubmit = async () => {
    if (!selectedUser?.id || !selectedCustomer?.id) {
      toast.show("Vui lòng chọn nhân viên và khách hàng");
      return;
    }

    setLoading(true);
    const payload: ICallHistoryRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      userId: selectedUser.id,
      customerId: selectedCustomer.id,
      callType,
      outcome,
      interestLevel: outcome === 3 ? 0 : interestLevel,
      duration: outcome === 3 ? 0 : Number(duration),
      note,
      status,
    };

    await onSubmit(payload);
    setLoading(false);
  };

  const isDeleteMode = type === "delete";

  const renderStars = () => {
    const disabled = outcome === 3 || isDetail;
    return (
      <View style={[styles.ratingContainer, disabled && { opacity: 0.5 }]}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} disabled={disabled} onPress={() => setInterestLevel(star)}>
            <Ionicons name="star" size={24} color={interestLevel >= star ? "#ffc107" : "#e0e0e0"} />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>({interestLevel}/5)</Text>
      </View>
    );
  };

  return (
    <Modal animationType="fade" transparent={true} visible={shown} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {type === "add" ? "Thêm Cuộc Gọi" : type === "edit" ? "Cập Nhật" : isDeleteMode ? "Xóa Cuộc Gọi" : "Chi Tiết"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

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
                <Text style={styles.confirmText}>Xóa lịch sử cuộc gọi này?</Text>
                <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Nhân viên */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Nhân viên <Text style={{ color: COLORS.danger }}>*</Text>
                  </Text>
                  <SelectCustom
                    options={userOptions}
                    value={selectedUser?.id}
                    onChange={setSelectedUser}
                    disabled={isDetail}
                    placeholder="Chọn nhân viên"
                  />
                </View>

                {/* Khách hàng */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Khách hàng <Text style={{ color: COLORS.danger }}>*</Text>
                  </Text>
                  <SelectCustom
                    options={customerOptions}
                    value={selectedCustomer?.id}
                    onChange={setSelectedCustomer}
                    disabled={isDetail}
                    placeholder="Chọn khách hàng"
                  />
                </View>

                {/* Loại cuộc gọi */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Loại cuộc gọi</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && setCallType(1)}>
                      <Ionicons name={callType === 1 ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                      <Ionicons name="call-outline" size={18} color={COLORS.text} />
                      <Text style={styles.radioLabel}>Audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && setCallType(2)}>
                      <Ionicons name={callType === 2 ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                      <Ionicons name="videocam-outline" size={18} color={COLORS.text} />
                      <Text style={styles.radioLabel}>Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Trạng thái */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Trạng thái</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && setStatus(1)}>
                      <Ionicons name={status === 1 ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                      <Text style={styles.radioLabel}>Hoạt động</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && setStatus(0)}>
                      <Ionicons name={status === 0 ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                      <Text style={styles.radioLabel}>Ngưng hoạt động</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Kết quả */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Kết quả</Text>
                  <SelectCustom
                    options={outcomeOptions}
                    value={outcome}
                    onChange={(opt: any) => setOutcome(Number(opt.id))}
                    disabled={isDetail}
                    placeholder="Chọn kết quả"
                  />
                </View>

                {/* Thời lượng */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Thời lượng (s)</Text>
                  <TextInput
                    style={[styles.input, (isDetail || outcome === 3) && styles.inputDisabled]}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    editable={!isDetail && outcome !== 3}
                  />
                </View>

                {/* Mức độ hài lòng */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mức độ hài lòng</Text>
                  {renderStars()}
                </View>

                {/* Ghi chú */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ghi chú</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    placeholder="Nội dung cuộc gọi..."
                    placeholderTextColor={COLORS.textGray}
                    editable={!isDetail}
                  />
                </View>
              </ScrollView>
            )}

            {/* FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                <Text style={[styles.textStyle, { color: COLORS.text }]}>{isDetail ? "Đóng" : "Hủy"}</Text>
              </TouchableOpacity>

              {!isDetail && (
                <TouchableOpacity
                  style={[styles.button, isDeleteMode ? styles.buttonDelete : styles.buttonSave]}
                  onPress={
                    isDeleteMode
                      ? async () => {
                          setLoading(true);
                          if (onDelete) await onDelete();
                          setLoading(false);
                        }
                      : handleSubmit
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={[styles.textStyle, { color: "white" }]}>
                      {isDeleteMode ? "Xóa ngay" : type === "add" ? "Tạo mới" : "Lưu thay đổi"}
                    </Text>
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
