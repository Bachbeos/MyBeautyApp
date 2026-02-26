import React, { useState, useEffect, useRef } from "react";
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
import { styles, COLORS } from "../Product.styles";
import { IProductResponse } from "../../../model/product/ProductResponseModel";
import { IProductRequest } from "../../../model/product/ProductRequestModel";
import ProductService from "../../../services/ProductService";
import { uploadFile } from "../../../services/UploadFileService";
import { getToken } from "../../../utils/common";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";

interface SelectOption {
  id: number | string;
  name: string;
}

interface ModalProductProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IProductResponse | null;
  onClose: () => void;
  onSubmit: (data: IProductRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const formatMoney = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseMoney = (value: string | undefined): number => {
  if (!value) return 0;
  return Number(String(value).replace(/\./g, ""));
};

const ModalProduct: React.FC<ModalProductProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountUnit, setDiscountUnit] = useState<number>(1);
  const [expiredPeriod, setExpiredPeriod] = useState("");
  const [position, setPosition] = useState("1");
  const [status, setStatus] = useState(1);
  const [content, setContent] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    if (shown && (type === "add" || type === "edit")) {
      const fetchData = async () => {
        const token = await getToken();
        if (!token) return;
        try {
          const [cateRes, unitRes] = await Promise.all([
            ProductService.getCategory({ page: 1, limit: 1000, level: 2, type: 1 }, token),
            ProductService.getUnit({ page: 1, limit: 1000 }, token),
          ]);

          if (cateRes?.code === 200) {
            setCategoryOptions(cateRes.result.items?.map((i: any) => ({ id: i.id, name: i.name })) || []);
          }
          if (unitRes?.code === 200) {
            setUnitOptions(unitRes.result.items?.map((i: any) => ({ id: i.id, name: i.name })) || []);
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu tùy chọn:", error);
        }
      };
      fetchData();
    }
  }, [shown, type]);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setCode(item.code || "");
        setName(item.name || "");
        setAvatar(item.avatar || "");
        setPrice(formatMoney(item.price));
        setDiscount(item.discount ? String(item.discount) : "");
        setDiscountUnit(item.discountUnit || 1);
        setExpiredPeriod(item.expiredPeriod ? String(item.expiredPeriod) : "");
        setPosition(item.position ? String(item.position) : "1");
        setStatus(item.status ?? 1);
        setContent(item.content || "");
      } else if (type === "add") {
        resetForm();
      }
    }
  }, [shown, type, item]);

  useEffect(() => {
    if (item && (type === "edit" || type === "detail")) {
      if (categoryOptions.length > 0) {
        const cate = categoryOptions.find((c) => c.id == item.categoryId);
        setSelectedCategory(cate || null);
      }
      if (unitOptions.length > 0) {
        const unit = unitOptions.find((u) => u.id == item.unitId);
        setSelectedUnit(unit || null);
      }
    }
  }, [categoryOptions, unitOptions, item, type]);

  const resetForm = () => {
    setCode("");
    setName("");
    setAvatar("");
    setPrice("");
    setDiscount("");
    setDiscountUnit(1);
    setExpiredPeriod("");
    setPosition("1");
    setStatus(1);
    setContent("");
    setSelectedCategory(null);
    setSelectedUnit(null);
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
        name: asset.fileName || `product_${Date.now()}.jpg`,
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

    if (!name.trim() || !code.trim()) {
      alert("Vui lòng nhập Tên và Mã sản phẩm (*)");
      return;
    }

    const payload: IProductRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      name,
      code,
      avatar,
      price: parseMoney(price),
      discount: Number(discount || 0),
      discountUnit,
      position: Number(position || 0),
      expiredPeriod: Number(expiredPeriod || 0),
      status,
      content,
      categoryId: selectedCategory ? Number(selectedCategory.id) : undefined,
      unitId: selectedUnit ? Number(selectedUnit.id) : undefined,
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
                  {type === "add" ? "Thêm sản phẩm" : type === "edit" ? "Cập nhật sản phẩm" : isDeleteMode ? "Xóa sản phẩm" : "Chi tiết"}
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

                <View style={[{ marginTop: 16 }]}>
                  <View style={[styles.formGroup, { marginBottom: 16 }]}>
                    {renderLabel("Mã sản phẩm", true)}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      placeholder="Mã sản phẩm"
                      placeholderTextColor={COLORS.textGray}
                      value={code}
                      onChangeText={setCode}
                      editable={!isViewOnly}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    {renderLabel("Tên sản phẩm", true)}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      placeholder="Tên sản phẩm"
                      placeholderTextColor={COLORS.textGray}
                      value={name}
                      onChangeText={setName}
                      editable={!isViewOnly}
                    />
                  </View>
                </View>

                <View style={[{ marginTop: 16 }]}>
                  <View style={[styles.formGroup, { marginTop: -16 }]}>
                    <SelectCustom
                      label="Danh mục"
                      options={categoryOptions}
                      value={selectedCategory?.id}
                      onChange={(opt) => setSelectedCategory(opt as SelectOption)}
                      disabled={isViewOnly}
                      placeholder="Chọn danh mục"
                    />
                  </View>
                  <View style={[styles.formGroup, { marginTop: -16 }]}>
                    <SelectCustom
                      label="Đơn vị tính"
                      options={unitOptions}
                      value={selectedUnit?.id}
                      onChange={(opt) => setSelectedUnit(opt as SelectOption)}
                      disabled={isViewOnly}
                      placeholder="Chọn đơn vị tính"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    {renderLabel("Giá bán (VNĐ)")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      placeholder="0"
                      placeholderTextColor={COLORS.textGray}
                      keyboardType="numeric"
                      value={price}
                      onChangeText={(t) => setPrice(formatMoney(t))}
                      editable={!isViewOnly}
                    />
                  </View>

                  <View style={styles.col}>
                    {renderLabel("Giảm giá")}
                    <View style={[styles.discountContainer, isViewOnly && { borderColor: "transparent" }]}>
                      <TextInput
                        style={[styles.discountInput, isViewOnly && styles.inputDisabled]}
                        placeholder="0"
                        placeholderTextColor={COLORS.textGray}
                        keyboardType="numeric"
                        value={discount}
                        onChangeText={setDiscount}
                        editable={!isViewOnly}
                      />
                      <TouchableOpacity
                        style={[styles.unitButton, discountUnit === 1 && styles.unitActive]}
                        onPress={() => !isViewOnly && setDiscountUnit(1)}
                        disabled={isViewOnly}
                      >
                        <Text style={[styles.unitText, discountUnit === 1 && styles.unitTextActive]}>%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.unitButton, discountUnit === 2 && styles.unitActive]}
                        onPress={() => !isViewOnly && setDiscountUnit(2)}
                        disabled={isViewOnly}
                      >
                        <Text style={[styles.unitText, discountUnit === 2 && styles.unitTextActive]}>$</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={[styles.row, { marginTop: 16 }]}>
                  <View style={styles.col}>
                    {renderLabel("Hạn sử dụng (Tháng)")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      placeholder="0"
                      keyboardType="numeric"
                      value={expiredPeriod}
                      onChangeText={setExpiredPeriod}
                      editable={!isViewOnly}
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Thứ tự")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      placeholder="0"
                      keyboardType="numeric"
                      value={position}
                      onChangeText={setPosition}
                      editable={!isViewOnly}
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { marginTop: 16 }]}>
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

                <View style={styles.formGroup}>
                  {renderLabel("Mô tả chi tiết")}
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập mô tả..."
                    placeholderTextColor={COLORS.textGray}
                    multiline={true}
                    numberOfLines={3}
                    value={content}
                    onChangeText={setContent}
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

export default ModalProduct;
