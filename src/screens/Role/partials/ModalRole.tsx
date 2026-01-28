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
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "../Role.styles";
import { IRoleItem } from "../../../model/role/RoleResponseModel";
import { IRoleUpdateRequest } from "../../../model/role/RoleRequestModel";

interface RoleModalProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IRoleItem | null;
  onClose: () => void;
  onSubmit: (data: IRoleUpdateRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ModalRole: React.FC<RoleModalProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        setIsDefault(Number(item.isDefault) === 1);
        setIsOperator(Number(item.isOperator) === 1);
      } else {
        // Reset cho form Add
        setName("");
        setIsDefault(false);
        setIsOperator(false);
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
      alert("Vui lòng nhập tên vai trò (*)");
      return;
    }

    const payload: IRoleUpdateRequest = {
      name,
      isDefault: isDefault ? 1 : 0,
      isOperator: isOperator ? 1 : 0,
      ...(type === "edit" && item ? { id: item.id } : {}),
    };

    setLoading(true);
    await onSubmit(payload);
    setLoading(false);
  };

  const isDeleteMode = type === "delete";
  const isDetailMode = type === "detail";
  const isViewOnly = isDetailMode;

  return (
    <Modal animationType="fade" transparent={true} visible={shown} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {type === "add" ? "Thêm vai trò" : type === "edit" ? "Sửa vai trò" : isDeleteMode ? "Xóa vai trò" : "Chi tiết vai trò"}
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
              <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Tên vai trò <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập tên vai trò"
                    value={name}
                    onChangeText={setName}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Cấu hình quyền</Text>

                  <View style={[styles.checkboxItem, { justifyContent: "space-between", width: "100%" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.checkboxLabel}>Quyền mặc định</Text>
                    </View>
                    <Switch
                      value={isDefault}
                      onValueChange={isViewOnly ? undefined : setIsDefault}
                      trackColor={{ false: "#767577", true: COLORS.primary }}
                      thumbColor={COLORS.white}
                      disabled={isViewOnly}
                    />
                  </View>

                  <View style={[styles.checkboxItem, { justifyContent: "space-between", width: "100%", marginBottom: 0 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.checkboxLabel}>Quyền điều hành</Text>
                    </View>
                    <Switch
                      value={isOperator}
                      onValueChange={isViewOnly ? undefined : setIsOperator}
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

export default ModalRole;
