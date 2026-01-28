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
  Image,
  Pressable,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IBranchResponse } from "../../../model/branch/BranchResponseModel";
import { IBranchRequest } from "../../../model/branch/BranchRequestModel";
import BranchService from "../../../services/BranchService";
import UserService from "../../../services/UserService";
import { styles, COLORS } from "../Branch.styles";
import { getToken } from "../../../utils/common";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "../../../services/UploadFileService";

interface SelectOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface ModalBranchProps {
  visible: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IBranchResponse | null;
  onClose: () => void;
  onSubmit: (data: IBranchRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ModalBranch: React.FC<ModalBranchProps> = ({ visible, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(1);
  const [avatar, setAvatar] = useState("");
  const [foundingDay, setFoundingDay] = useState("");
  const [foundingMonth, setFoundingMonth] = useState("");
  const [foundingYear, setFoundingYear] = useState("");
  const [parentOptions, setParentOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    if (visible && (type === "add" || type === "edit")) {
      fetchOptions();
    }
  }, [visible, type]);

  const fetchOptions = async () => {
    const token = await getToken();
    if (!token) return;

    const resBranch = await BranchService.list({ page: 1, limit: 1000 }, token);
    if (resBranch?.code === 200 && resBranch.result.items) {
      let branches = resBranch.result.items;
      if (type === "edit" && item) {
        branches = branches.filter((b: any) => b.id !== item.id);
      }
      const formattedBranches: SelectOption[] = branches.map((b: any) => ({
        id: b.id ?? 0,
        name: b.name,
        ...b,
      }));
      setParentOptions(formattedBranches);
    } else {
      setParentOptions([]);
    }

    const resUser = await UserService.list({ page: 1, limit: 1000 }, token);
    if (resUser?.code === 200 && resUser.result.items) {
      const formattedUsers: SelectOption[] = resUser.result.items.map((u: any) => ({
        id: u.id ?? 0,
        name: u.name || "Unknown",
      }));
      setUserOptions(formattedUsers);
    } else {
      setUserOptions([]);
    }
  };

  useEffect(() => {
    if (visible) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        setAddress(item.address || "");
        setPhone(item.phone || "");
        setEmail(item.email || "");
        setWebsite(item.website || "");
        setDescription(item.description || "");
        setStatus(item.status ?? 1);
        setAvatar(item.avatar || "");
        setFoundingDay(item.foundingDay ? String(item.foundingDay) : "");
        setFoundingMonth(item.foundingMonth ? String(item.foundingMonth) : "");
        setFoundingYear(item.foundingYear ? String(item.foundingYear) : "");
        setParentId(item.parentId);
        setOwnerId(item.ownerId);
      } else if (type === "add") {
        resetForm();
      }
    }
  }, [visible, type, item]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setDescription("");
    setStatus(1);
    setAvatar("");
    setFoundingDay("");
    setFoundingMonth("");
    setFoundingYear("");
    setParentId(undefined);
    setOwnerId(undefined);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần cấp quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const token = await getToken();
      if (!token) return;

      setUploadingImg(true);
      const fileToUpload = {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      try {
        const res = await uploadFile(fileToUpload as any, token);
        if (res && res.code === 200 && res.result) {
          setAvatar(res.result);
        } else {
          alert("Upload ảnh thất bại.");
        }
      } catch (error) {
        alert("Lỗi kết nối khi upload ảnh.");
      } finally {
        setUploadingImg(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (type === "delete") {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!name.trim() || !address.trim() || !phone.trim() || !email.trim()) {
      alert("Vui lòng nhập các trường bắt buộc (*)");
      return;
    }

    const payload: IBranchRequest = {
      id: type === "edit" && item ? item.id : undefined,
      name,
      address,
      phone,
      email,
      website,
      description,
      status,
      avatar,
      parentId,
      ownerId,
      foundingDay: foundingDay ? Number(foundingDay) : undefined,
      foundingMonth: foundingMonth ? Number(foundingMonth) : undefined,
      foundingYear: foundingYear ? Number(foundingYear) : undefined,
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

  const isDetail = type === "detail";
  const isDelete = type === "delete";

  if (!type) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <Text style={[styles.modalTitle, { flex: 0 }]} numberOfLines={1}>
                  {type === "add" ? "Thêm chi nhánh" : type === "edit" ? "Cập nhật" : isDetail ? "Chi tiết" : "Xóa chi nhánh"}
                </Text>
                {(type === "edit" || isDetail) && item && (
                  <Text style={{ fontSize: 13, color: COLORS.textGray }} numberOfLines={1}>
                    {item.name}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            {isDelete ? (
              <View style={styles.deleteBody}>
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
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                  <TouchableOpacity onPress={isDetail ? undefined : handlePickImage} style={styles.avatarContainer} disabled={uploadingImg}>
                    {uploadingImg ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : avatar ? (
                      <Image source={{ uri: avatar }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="camera-outline" size={32} color={COLORS.textGray} />
                    )}

                    {!isDetail && !uploadingImg && (
                      <View style={styles.editAvatarBadge}>
                        <Ionicons name="pencil" size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {!isDetail && <Text style={styles.avatarHint}>{uploadingImg ? "Đang tải lên..." : "Chạm để thay đổi ảnh"}</Text>}
                </View>

                <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

                <View style={styles.formGroup}>
                  {renderLabel("Tên chi nhánh", true)}
                  <TextInput
                    style={[styles.input, isDetail && styles.inputDisabled]}
                    value={name}
                    onChangeText={setName}
                    editable={!isDetail}
                    placeholder="Nhập tên chi nhánh"
                    placeholderTextColor={COLORS.textGray}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    {renderLabel("Ngày")}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={foundingDay}
                      onChangeText={setFoundingDay}
                      keyboardType="numeric"
                      editable={!isDetail}
                      placeholder="DD"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    {renderLabel("Tháng")}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={foundingMonth}
                      onChangeText={setFoundingMonth}
                      keyboardType="numeric"
                      editable={!isDetail}
                      placeholder="MM"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    {renderLabel("Năm")}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={foundingYear}
                      onChangeText={setFoundingYear}
                      keyboardType="numeric"
                      editable={!isDetail}
                      placeholder="YYYY"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Trạng thái hoạt động")}
                  <View style={styles.switchRow}>
                    <Text style={{ color: status === 1 ? COLORS.success : COLORS.textGray }}>
                      {status === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </Text>
                    {!isDetail && (
                      <Switch
                        value={status === 1}
                        onValueChange={(val) => setStatus(val ? 1 : 0)}
                        trackColor={{ false: "#767577", true: COLORS.primary }}
                        thumbColor={COLORS.white}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Mô tả")}
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }, isDetail && styles.inputDisabled]}
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    editable={!isDetail}
                    placeholder="Nhập mô tả"
                    placeholderTextColor={COLORS.textGray}
                  />
                </View>

                <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

                <View style={styles.formGroup}>
                  {renderLabel("Địa chỉ", true)}
                  <TextInput
                    style={[styles.input, isDetail && styles.inputDisabled]}
                    value={address}
                    onChangeText={setAddress}
                    editable={!isDetail}
                    placeholder="Nhập địa chỉ"
                    placeholderTextColor={COLORS.textGray} /* Đã thêm */
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    {renderLabel("Số điện thoại", true)}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      editable={!isDetail}
                      placeholder="Nhập số điện thoại"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    {renderLabel("Email", true)}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      editable={!isDetail}
                      placeholder="Nhập email"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Website")}
                  <TextInput
                    style={[styles.input, isDetail && styles.inputDisabled]}
                    value={website}
                    onChangeText={setWebsite}
                    editable={!isDetail}
                    placeholder="Nhập website"
                    placeholderTextColor={COLORS.textGray}
                  />
                </View>

                <SelectCustom
                  label="Chi nhánh cha"
                  placeholder="Chọn chi nhánh cha"
                  options={parentOptions}
                  value={parentId}
                  onChange={(item) => setParentId(Number(item.id))}
                  disabled={isDetail}
                  title="Danh sách chi nhánh"
                />

                <SelectCustom
                  label="Người phụ trách"
                  placeholder="Chọn người phụ trách"
                  options={userOptions}
                  value={ownerId}
                  onChange={(item) => setOwnerId(Number(item.id))}
                  disabled={isDetail}
                  title="Danh sách nhân viên"
                />

                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                <Text style={[styles.textStyle, { color: COLORS.text }]}>{isDetail ? "Đóng" : "Hủy"}</Text>
              </TouchableOpacity>
              {!isDetail && (
                <TouchableOpacity
                  style={[styles.button, isDelete ? styles.buttonDelete : styles.buttonSave]}
                  onPress={handleSubmit}
                  disabled={loading || uploadingImg}
                >
                  {loading || uploadingImg ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.textStyle}>{isDelete ? "Đồng ý, xóa" : type === "add" ? "Tạo mới" : "Lưu thay đổi"}</Text>
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

export default ModalBranch;
