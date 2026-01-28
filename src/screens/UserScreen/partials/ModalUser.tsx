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
import { styles, COLORS } from "../User.styles";
import { IUser } from "../../../model/user/UserResponseModel";
import { IUserUpdateRequest } from "../../../model/user/UserRequestModel";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";
import BranchService from "../../../services/BranchService";
import { getToken } from "../../../utils/common";

interface SelectOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface ModalUserProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IUser | null;
  onClose: () => void;
  onSubmit: (data: IUserUpdateRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ModalUser: React.FC<ModalUserProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plainPassword, setPlainPassword] = useState("");
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(1);
  const [branchOptions, setBranchOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shown && (type === "add" || type === "edit")) {
      const fetchBranches = async () => {
        const token = await getToken();
        if (!token) return;
        const res = await BranchService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          const options = res.result.items.map((b: any) => ({
            id: b.id,
            name: b.name,
          }));
          setBranchOptions(options);
        } else {
          setBranchOptions([]);
        }
      };
      fetchBranches();
    }
  }, [shown, type]);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        setPhone(item.phone ? String(item.phone) : "");
        setEmail(item.email || "");
        setPlainPassword("");
        setBranchId(item.branchId ? Number(item.branchId) : undefined);
        setActive(item.active !== undefined ? Number(item.active) : 1);
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setPlainPassword("");
        setBranchId(undefined);
        setActive(1);
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

    if (!name.trim() || !phone.trim()) {
      alert("Vui lòng nhập Tên và Số điện thoại (*)");
      return;
    }

    const payload: IUserUpdateRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      name,
      phone,
      email,
      branchId,
      active,
      plainPassword: plainPassword || undefined,
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
                  {type === "add" ? "Thêm người dùng" : type === "edit" ? "Cập nhật" : isDeleteMode ? "Xóa người dùng" : "Chi tiết"}
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
                  {renderLabel("Tên người dùng", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập tên người dùng"
                    placeholderTextColor={COLORS.textGray}
                    value={name}
                    onChangeText={setName}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Số điện thoại", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor={COLORS.textGray}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Email")}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập email"
                    placeholderTextColor={COLORS.textGray}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!isViewOnly}
                  />
                </View>

                <SelectCustom
                  label="Chi nhánh"
                  placeholder="Chọn chi nhánh"
                  options={branchOptions}
                  value={branchId}
                  onChange={(opt) => setBranchId(Number(opt.id))}
                  disabled={isViewOnly}
                  title="Danh sách chi nhánh"
                />

                {!isDetailMode && (
                  <View style={styles.formGroup}>
                    {renderLabel(type === "add" ? "Mật khẩu" : "Mật khẩu mới (Để trống nếu không đổi)")}
                    <TextInput
                      style={[styles.input]}
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor={COLORS.textGray}
                      value={plainPassword}
                      onChangeText={setPlainPassword}
                      secureTextEntry={true}
                    />
                  </View>
                )}

                <View style={styles.formGroup}>
                  {renderLabel("Trạng thái")}
                  <View style={styles.switchRow}>
                    <Text style={{ color: active === 1 ? COLORS.success : COLORS.textGray }}>
                      {active === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </Text>
                    <Switch
                      value={active === 1}
                      onValueChange={(val) => {
                        if (!isViewOnly) setActive(val ? 1 : 0);
                      }}
                      trackColor={{ false: "#767577", true: COLORS.primary }}
                      thumbColor={COLORS.white}
                      disabled={isViewOnly}
                    />
                  </View>
                </View>

                <View style={{ height: 20 }} />
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

export default ModalUser;
