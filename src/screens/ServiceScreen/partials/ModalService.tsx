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
import { styles, COLORS } from "../Service.styles";
import { IServiceResponse } from "../../../model/service/ServiceResponseModel";
import { IServiceRequest, IComboItem } from "../../../model/service/ServiceRequestModel";
import CategoryService from "../../../services/CategoryService";
import { uploadFile } from "../../../services/UploadFileService";
import { getToken } from "../../../utils/common";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";

interface SelectOption {
  id: number | string;
  name: string;
}

interface ModalServiceProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IServiceResponse | null;
  onClose: () => void;
  onSubmit: (data: IServiceRequest) => Promise<void>;
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

const ModalService: React.FC<ModalServiceProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [avatar, setAvatar] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [discount, setDiscount] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [treatmentNum, setTreatmentNum] = useState("");
  const [intro, setIntro] = useState("");

  const [isCombo, setIsCombo] = useState<number>(0);
  const [featured, setFeatured] = useState<number>(0);

  const [comboItems, setComboItems] = useState<IComboItem[]>([]);

  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    if (shown && (type === "add" || type === "edit")) {
      const fetchCats = async () => {
        const token = await getToken();
        if (token) {
          const res = await CategoryService.list({ page: 1, limit: 1000 }, token);
          if (res?.code === 200) {
            setCategoryOptions(res.result.items?.map((i: any) => ({ id: i.id, name: i.name })) || []);
          }
        }
      };
      fetchCats();
    }
  }, [shown, type]);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setName(item.name || "");
        setCode(item.code || "");
        setAvatar(item.avatar || "");
        setPrice(formatMoney(item.price));
        setCost(formatMoney(item.cost));
        setDiscount(item.discount ? String(item.discount) : "");
        setTotalTime(item.totalTime ? String(item.totalTime) : "");
        setTreatmentNum(item.treatmentNum ? String(item.treatmentNum) : "");
        setIntro(item.intro || "");
        setIsCombo(item.isCombo || 0);
        setFeatured(item.featured || 0);
        try {
          const parsedCombos = item.priceVariation ? JSON.parse(item.priceVariation) : [];
          setComboItems(parsedCombos);
        } catch (e) {
          setComboItems([]);
        }
      } else if (type === "add") {
        resetForm();
      }
    }
  }, [shown, type, item]);

  useEffect(() => {
    if (item && (type === "edit" || type === "detail") && categoryOptions.length > 0) {
      const cate = categoryOptions.find((c) => c.id == item.categoryId);
      setSelectedCategory(cate || null);
    }
  }, [categoryOptions, item, type]);

  const resetForm = () => {
    setName("");
    setCode("");
    setAvatar("");
    setPrice("");
    setCost("");
    setDiscount("");
    setTotalTime("");
    setTreatmentNum("");
    setIntro("");
    setIsCombo(0);
    setFeatured(0);
    setComboItems([]);
    setSelectedCategory(null);
  };

  const addComboRow = () => {
    setComboItems([
      ...comboItems,
      {
        priceId: `new_${Date.now()}`,
        name: "",
        price: 0,
        discount: 0,
        treatmentNum: 1,
      },
    ]);
  };

  const removeComboRow = (index: number) => {
    const newItems = [...comboItems];
    newItems.splice(index, 1);
    setComboItems(newItems);
  };

  const updateComboRow = (index: number, field: keyof IComboItem, value: any) => {
    const newItems = [...comboItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setComboItems(newItems);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần cấp quyền thư viện ảnh!");
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
        name: asset.fileName || `service_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      try {
        const res = await uploadFile(fileToUpload as any, token);
        if (res && res.code === 200) setAvatar(res.result);
        else alert("Upload thất bại");
      } catch (e) {
        alert("Lỗi upload ảnh");
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
      alert("Vui lòng nhập Tên dịch vụ (*)");
      return;
    }

    const payload: IServiceRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      name,
      code,
      intro,
      avatar,
      categoryId: selectedCategory ? Number(selectedCategory.id) : undefined,

      cost: parseMoney(cost),
      price: parseMoney(price),

      discount: Number(discount || 0),
      totalTime: Number(totalTime || 0),
      treatmentNum: Number(treatmentNum || 1),
      isCombo,
      featured,
      parentId: item?.parentId || 0,
      priceVariation: JSON.stringify(comboItems),
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
                  {type === "add" ? "Thêm dịch vụ" : type === "edit" ? "Cập nhật" : isDeleteMode ? "Xóa dịch vụ" : "Chi tiết"}
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

                <View style={[styles.row, { marginTop: 16 }]}>
                  <View style={styles.col}>
                    {renderLabel("Mã dịch vụ")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={code}
                      onChangeText={setCode}
                      editable={!isViewOnly}
                      placeholder="Mã dịch vụ"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>
                  <View style={[styles.col]}>
                    {renderLabel("Tên dịch vụ", true)}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={name}
                      onChangeText={setName}
                      editable={!isViewOnly}
                      placeholder="Tên dịch vụ"
                      placeholderTextColor={COLORS.textGray}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 16 }}>
                  <SelectCustom
                    label="Danh mục"
                    options={categoryOptions}
                    value={selectedCategory?.id}
                    onChange={(opt) => setSelectedCategory(opt as SelectOption)}
                    disabled={isViewOnly}
                    placeholder="Chọn danh mục"
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    {renderLabel("Giá bán (VNĐ)")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={price}
                      onChangeText={(t) => setPrice(formatMoney(t))}
                      keyboardType="numeric"
                      editable={!isViewOnly}
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Giá vốn (VNĐ)")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={cost}
                      onChangeText={(t) => setCost(formatMoney(t))}
                      keyboardType="numeric"
                      editable={!isViewOnly}
                      placeholder="0"
                    />
                  </View>
                </View>

                <View style={[styles.row, { marginTop: 16 }]}>
                  <View style={styles.col}>
                    {renderLabel("Giảm giá (%)")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={discount}
                      onChangeText={setDiscount}
                      keyboardType="numeric"
                      editable={!isViewOnly}
                      placeholder="0"
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Số buổi")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={treatmentNum}
                      onChangeText={setTreatmentNum}
                      keyboardType="numeric"
                      editable={!isViewOnly}
                      placeholder="1"
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Phút/buổi")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      value={totalTime}
                      onChangeText={setTotalTime}
                      keyboardType="numeric"
                      editable={!isViewOnly}
                      placeholder="0"
                    />
                  </View>
                </View>

                <View style={styles.optionRow}>
                  <Text style={{ fontSize: 14, fontWeight: "500", minWidth: 80 }}>Loại dịch vụ:</Text>
                  <TouchableOpacity style={styles.radioItem} onPress={() => !isViewOnly && setIsCombo(0)} disabled={isViewOnly}>
                    <Ionicons
                      name={isCombo === 0 ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isCombo === 0 ? COLORS.primary : COLORS.textGray}
                    />
                    <Text>Thường</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.radioItem} onPress={() => !isViewOnly && setIsCombo(1)} disabled={isViewOnly}>
                    <Ionicons
                      name={isCombo === 1 ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isCombo === 1 ? COLORS.primary : COLORS.textGray}
                    />
                    <Text>Combo</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                  <Text style={{ fontSize: 14, fontWeight: "500", minWidth: 80 }}>Nổi bật:</Text>
                  <Switch
                    value={featured === 1}
                    onValueChange={(val) => {
                      if (!isViewOnly) setFeatured(val ? 1 : 0);
                    }}
                    trackColor={{ false: "#767577", true: COLORS.warning }}
                    thumbColor={COLORS.white}
                    disabled={isViewOnly}
                  />
                  <Text>{featured === 1 ? "Có" : "Không"}</Text>
                </View>

                {/* {isCombo === 1 && (
                  <View style={[styles.comboContainer, { marginTop: 10 }]}>
                    <View style={styles.comboHeader}>
                      <Text style={styles.comboTitle}>📦 BẢNG GIÁ COMBO</Text>
                      {!isViewOnly && (
                        <TouchableOpacity style={styles.addComboBtn} onPress={addComboRow}>
                          <Ionicons name="add" size={16} color={COLORS.primary} />
                          <Text style={styles.addComboText}>Thêm gói</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {comboItems.length === 0 ? (
                      <Text style={{ textAlign: "center", color: COLORS.textGray, padding: 10, fontStyle: "italic" }}>
                        Chưa có gói combo nào. Hãy ấn "Thêm gói".
                      </Text>
                    ) : (
                      comboItems.map((item, index) => (
                        <View key={index} style={styles.comboCard}>
                          <View style={styles.comboCardHeader}>
                            <Text style={styles.comboCardTitle}>Gói #{index + 1}</Text>
                            {!isViewOnly && (
                              <TouchableOpacity style={styles.deleteComboBtn} onPress={() => removeComboRow(index)}>
                                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                              </TouchableOpacity>
                            )}
                          </View>

                          <View style={styles.formGroup}>
                            <TextInput
                              style={[styles.input, { paddingVertical: 6, fontSize: 14 }]}
                              placeholder="Tên gói combo"
                              placeholderTextColor={COLORS.textGray}
                              value={item.name}
                              onChangeText={(t) => updateComboRow(index, "name", t)}
                              editable={!isViewOnly}
                            />
                          </View>

                          <View style={styles.row}>
                            <View style={styles.col}>
                              <TextInput
                                style={[styles.input, { paddingVertical: 6, fontSize: 14 }]}
                                placeholder="Giá bán"
                                keyboardType="numeric"
                                value={formatMoney(item.price)}
                                onChangeText={(t) => updateComboRow(index, "price", parseMoney(t))}
                                editable={!isViewOnly}
                              />
                            </View>
                            <View style={styles.col}>
                              <TextInput
                                style={[styles.input, { paddingVertical: 6, fontSize: 14 }]}
                                placeholder="Giảm (VNĐ)"
                                keyboardType="numeric"
                                value={formatMoney(item.discount)}
                                onChangeText={(t) => updateComboRow(index, "discount", parseMoney(t))}
                                editable={!isViewOnly}
                              />
                            </View>
                            <View style={[styles.col, { flex: 0.7 }]}>
                              <TextInput
                                style={[styles.input, { paddingVertical: 6, fontSize: 14 }]}
                                placeholder="Số buổi"
                                keyboardType="numeric"
                                value={String(item.treatmentNum)}
                                onChangeText={(t) => updateComboRow(index, "treatmentNum", Number(t))}
                                editable={!isViewOnly}
                              />
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )} */}

                <View style={styles.formGroup}>
                  {renderLabel("Giới thiệu", false)}
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập giới thiệu..."
                    placeholderTextColor={COLORS.textGray}
                    multiline={true}
                    numberOfLines={3}
                    value={intro}
                    onChangeText={setIntro}
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
                    <ActivityIndicator color="white" size="small" />
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

export default ModalService;
