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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "../ResourceScreen.styles";
import { IResourceItem } from "../../../model/resource/ResourceRespondModel";
import { IResourceUpdateRequest } from "../../../model/resource/ResourceRequestModel";

interface ResourceModalProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IResourceItem | null;
  onClose: () => void;
  onSubmit: (data: IResourceUpdateRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ACTION_LIST = ["VIEW", "ADD", "UPDATE", "DELETE"];

const ModalResource: React.FC<ResourceModalProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [uri, setUri] = useState("");
  const [description, setDescription] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        setCode(String(item.code || ""));
        setUri(item.uri || "");
        setDescription(item.description || "");

        try {
          const parsed = item.actions ? JSON.parse(item.actions) : [];
          setSelectedActions(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setSelectedActions([]);
        }
      } else {
        setName("");
        setCode("");
        setUri("");
        setDescription("");
        setSelectedActions([]);
      }
    }
  }, [shown, type, item]);

  const toggleAction = (action: string) => {
    if (type === "detail") return;
    setSelectedActions((prev) => (prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]));
  };

  const handleSubmit = async () => {
    if (type === "delete") {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!name.trim() || !code.trim() || !uri.trim()) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
      return;
    }

    const payload: IResourceUpdateRequest = {
      name: name,
      code: code,
      uri: uri,
      description: description,
      actions: JSON.stringify(selectedActions),
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
                  {type === "add" ? "Thêm tài nguyên" : type === "edit" ? "Sửa tài nguyên" : isDeleteMode ? "Xóa tài nguyên" : "Chi tiết tài nguyên"}
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
                  <Text style={styles.label}>
                    Tên tài nguyên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập tên tài nguyên"
                    placeholderTextColor={COLORS.textGray}
                    value={name}
                    onChangeText={setName}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Mã tài nguyên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập mã tài nguyên"
                    placeholderTextColor={COLORS.textGray}
                    value={code}
                    onChangeText={setCode}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Đường dẫn <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập đường dẫn"
                    placeholderTextColor={COLORS.textGray}
                    value={uri}
                    onChangeText={setUri}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Lựa chọn hành động</Text>
                  <View style={styles.checkboxContainer}>
                    {ACTION_LIST.map((action) => {
                      const isChecked = selectedActions.includes(action);
                      return (
                        <TouchableOpacity key={action} style={styles.checkboxItem} onPress={() => toggleAction(action)} disabled={isViewOnly}>
                          <Ionicons name={isChecked ? "checkbox" : "square-outline"} size={24} color={isChecked ? COLORS.primary : COLORS.textGray} />
                          <Text style={styles.checkboxLabel}>{action}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mô tả</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập mô tả"
                    placeholderTextColor={COLORS.textGray}
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={3}
                    editable={!isViewOnly}
                  />
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

export default ModalResource;
