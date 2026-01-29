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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { styles, COLORS } from "../Category.styles";
import { ICategoryResponse } from "../../../model/category/CategoryResponseModel";
import { ICategoryRequest } from "../../../model/category/CategoryRequestModel";
import CategoryService from "../../../services/CategoryService";
import { uploadFile } from "../../../services/UploadFileService";
import { getToken } from "../../../utils/common";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";

interface SelectOption {
  id: number | string;
  name: string;
}

interface ModalCategoryProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: ICategoryResponse | null;
  onClose: () => void;
  onSubmit: (data: ICategoryRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const typeOptions: SelectOption[] = [
  { id: 1, name: "Dịch vụ" },
  { id: 2, name: "Sản phẩm" },
];

const ModalCategory: React.FC<ModalCategoryProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<SelectOption>(typeOptions[0]);
  const [parentId, setParentId] = useState<number>(0);
  const [parentOptions, setParentOptions] = useState<SelectOption[]>([]);
  const [position, setPosition] = useState("1");
  const [active, setActive] = useState(1);
  const [featured, setFeatured] = useState("");
  const [avatar, setAvatar] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    if (shown && (type === "add" || type === "edit")) {
      const fetchParents = async () => {
        const token = await getToken();
        if (!token) return;
        try {
          const res = await CategoryService.list({ page: 1, limit: 1000, level: 0 }, token);
          if (res?.code === 200) {
            const list = res.result.items || [];
            const filtered = item ? list.filter((i: any) => i.id !== item.id) : list;
            const options = filtered.map((i: any) => ({ id: i.id, name: i.name }));
            setParentOptions([{ id: 0, name: "--- Là danh mục gốc ---" }, ...options]);
          }
        } catch (error) {
          console.log("Error fetching parents", error);
        }
      };
      fetchParents();
    }
  }, [shown, type, item]);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        const foundType = typeOptions.find((t) => t.id == item.type);
        setSelectedType(foundType || typeOptions[0]);
        setParentId(item.parentId || 0);
        setPosition(item.position ? String(item.position) : "1");
        setActive(item.active !== undefined ? Number(item.active) : 1);
        setFeatured(item.featured || "");
        setAvatar(item.avatar || "");
      } else if (type === "add") {
        resetForm();
      }
    }
  }, [shown, type, item]);

  const resetForm = () => {
    setName("");
    setSelectedType(typeOptions[0]);
    setParentId(0);
    setPosition("1");
    setActive(1);
    setFeatured("");
    setAvatar("");
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

    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục (*)");
      return;
    }

    const payload: ICategoryRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      name,
      type: Number(selectedType.id),
      parentId,
      position: Number(position) || 0,
      active,
      featured,
      avatar,
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
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {type === "add" ? "Thêm danh mục" : type === "edit" ? "Cập nhật" : isDeleteMode ? "Xóa danh mục" : "Chi tiết"}
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
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarSection}>
                  <TouchableOpacity
                    onPress={isViewOnly ? undefined : handlePickImage}
                    style={styles.avatarContainer}
                    disabled={uploadingImg || isViewOnly}
                  >
                    {uploadingImg ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : avatar ? (
                      <Image source={{ uri: avatar }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="camera-outline" size={32} color={COLORS.textGray} />
                    )}

                    {!isViewOnly && !uploadingImg && (
                      <View style={styles.editAvatarBadge}>
                        <Ionicons name="pencil" size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                  {!isViewOnly && <Text style={styles.avatarHint}>{uploadingImg ? "Đang tải lên..." : "Chạm để thay đổi ảnh"}</Text>}
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Tên danh mục", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập tên danh mục"
                    placeholderTextColor={COLORS.textGray}
                    value={name}
                    onChangeText={setName}
                    editable={!isViewOnly}
                  />
                </View>

                <SelectCustom
                  label="Loại danh mục"
                  options={typeOptions}
                  value={selectedType.id}
                  onChange={(opt) => setSelectedType(opt as SelectOption)}
                  disabled={isViewOnly}
                  placeholder="Chọn loại"
                />

                <SelectCustom
                  label="Danh mục cha"
                  options={parentOptions}
                  value={parentId}
                  onChange={(opt) => setParentId(Number(opt.id))}
                  disabled={isViewOnly}
                  placeholder="Chọn danh mục cha"
                />

                <View style={styles.formGroup}>
                  {renderLabel("Thứ tự hiển thị")}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="0"
                    keyboardType="numeric"
                    value={position}
                    onChangeText={setPosition}
                    editable={!isViewOnly}
                  />
                </View>

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

                <View style={styles.formGroup}>
                  {renderLabel("Mô tả")}
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập mô tả..."
                    placeholderTextColor={COLORS.textGray}
                    multiline={true}
                    numberOfLines={3}
                    value={featured}
                    onChangeText={setFeatured}
                    editable={!isViewOnly}
                  />
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
                  disabled={loading || uploadingImg}
                >
                  {loading || uploadingImg ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.textStyle}>{isDeleteMode ? "Xóa ngay" : type === "add" ? "Tạo mới" : "Lưu thay đổi"}</Text>
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

export default ModalCategory;
