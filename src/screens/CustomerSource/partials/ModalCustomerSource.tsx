import React, { useState, useEffect } from "react";
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
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "../CustomerSource.styles";
import { ICustomerSourceResponse } from "../../../model/customerSource/CustomerSourceResponseModel";
import { ICustomerSourceRequest } from "../../../model/customerSource/CustomerSourceRequestModel";

interface ModalProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: ICustomerSourceResponse | null;
  onClose: () => void;
  onSubmit: (data: ICustomerSourceRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ModalCustomerSource: React.FC<ModalProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        setStatus(item.status !== undefined ? Number(item.status) : 1);
      } else {
        setName("");
        setStatus(1);
      }
    }
  }, [shown, type, item]);

  const handleSubmit = async () => {
    if (type === "delete") {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      alert("Vui lòng nhập tên nguồn khách hàng (*)");
      return;
    }

    const payload: ICustomerSourceRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      name,
      status,
    };

    setLoading(true);
    await onSubmit(payload);
    setLoading(false);
  };

  const renderLabel = (text: string, required = false) => (
    <Text style={styles.label}>
      {text} {required && <Text style={{ color: COLORS.danger }}>*</Text>}
    </Text>
  );

  const isDeleteMode = type === "delete";
  const isDetailMode = type === "detail";
  const isViewOnly = isDetailMode;

  return (
    <Modal animationType="fade" transparent={true} visible={shown} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {type === "add" ? "Thêm nguồn khách hàng" : type === "edit" ? "Cập nhật" : isDeleteMode ? "Xóa nguồn khách hàng" : "Chi tiết"}
                </Text>
              </View>
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
                <Text style={styles.confirmText}>
                  Bạn có chắc muốn xóa <Text style={{ fontWeight: "bold" }}>{item?.name}</Text>?
                </Text>
                <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  {renderLabel("Tên nguồn khách hàng", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập tên nguồn..."
                    placeholderTextColor={COLORS.textGray}
                    value={name}
                    onChangeText={setName}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Trạng thái")}
                  <View style={styles.switchRow}>
                    <Text style={{ color: status === 1 ? COLORS.success : COLORS.textGray }}>
                      {status === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </Text>
                    <Switch
                      value={status === 1}
                      onValueChange={(val) => {
                        if (!isViewOnly) setStatus(val ? 1 : 0);
                      }}
                      trackColor={{ false: "#767577", true: COLORS.primary }}
                      thumbColor={COLORS.white}
                      disabled={isViewOnly}
                    />
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
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
                    <Text style={styles.textStyle}>{isDeleteMode ? "Đồng ý, xóa" : type === "add" ? "Tạo mới" : "Lưu thay đổi"}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ModalCustomerSource;
