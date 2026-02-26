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
  Image,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "expo-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { styles, COLORS } from "../Customer.styles";

import CustomerService from "../../../services/CustomerService";
import CustomerAttributeService from "../../../services/CustomerAttributeService";
import CustomerSourceService from "../../../services/CustomerSourceService";
import { uploadFile } from "../../../services/UploadFileService";
import { getToken } from "../../../utils/common";

import SelectCustom from "../../../components/SelectCustom/SelectCustom";
import DatePickerCustom from "../../../components/DatePicker/DatePickerCustom";

import type { ICustomerRequest } from "../../../model/customer/CustomerRequestModel";
import type { ICustomerResponse, ICustomerExtraInfo } from "../../../model/customer/CustomerResponseModel";
import type { ICustomerAttributeResponse } from "../../../model/customerAttribute/CustomerAttributeResponseModel";

type ModalType = "add" | "edit" | "delete" | "detail" | null;

interface ModalProps {
  type: ModalType;
  shown: boolean;
  item?: ICustomerResponse;
  onClose: () => void;
  onSubmit: (payload: ICustomerRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ModalCustomer({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const toast = useToast();
  const isDetail = type === "detail";
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- STATIC FIELDS ---
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<number>(1);
  const [birthday, setBirthday] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any>(null);

  // --- DYNAMIC FIELDS ---
  const [attributes, setAttributes] = useState<ICustomerAttributeResponse[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<number, { id?: number | null; value: string }>>({});

  // --- ACCORDION STATE ---
  const [expandBasic, setExpandBasic] = useState(true);
  const [expandAddress, setExpandAddress] = useState(false);
  const [expandExtra, setExpandExtra] = useState(false);

  // --- INIT DATA ---
  useEffect(() => {
    if (shown) {
      if ((type === "add" || type === "edit") && sourceOptions.length === 0) {
        loadSources();
      }
      loadAttributes();

      if (type === "add") {
        resetForm();
      } else if ((type === "edit" || type === "detail") && item) {
        fillForm(item);
        if (type === "edit") loadExistingExtraInfos(item.id);
      }
    }
  }, [shown, type, item]);

  const loadSources = async () => {
    const token = await getToken();
    if (!token) return;
    const res = await CustomerSourceService.list({ page: 1, limit: 100 }, token);
    if (res?.code === 200) setSourceOptions(res.result.items || []);
  };

  const loadAttributes = async () => {
    const token = await getToken();
    if (!token) return;
    const res = await CustomerAttributeService.listChildren(token);
    if (res?.code === 200) {
      const attrs = res.result?.items ?? res.result ?? [];
      setAttributes(attrs);
      if (type === "add") {
        const initVals: any = {};
        attrs.forEach((a: any) => (initVals[a.id] = { id: null, value: "" }));
        setAttributeValues(initVals);
      }
    }
  };

  const loadExistingExtraInfos = async (customerId: number) => {
    const token = await getToken();
    if (!token) return;
    const res = await CustomerService.listByCustomer(customerId, token);
    if (res?.code === 200) {
      const infos = res.result || [];
      setAttributeValues((prev) => {
        const next = { ...prev };
        infos.forEach((info: ICustomerExtraInfo) => {
          next[info.attributeId] = { id: info.id, value: info.attributeValue || "" };
        });
        return next;
      });
    }
  };

  const resetForm = () => {
    setName("");
    setAvatar("");
    setPhone("");
    setEmail("");
    setAddress("");
    setAge("");
    setGender(1);
    setBirthday("");
    setHeight("");
    setWeight("");
    setNote("");
    setSelectedSource(null);
    setAttributeValues({});
    setExpandBasic(true);
    setExpandAddress(false);
    setExpandExtra(false);
  };

  const fillForm = (data: ICustomerResponse) => {
    setName(data.name || "");
    setAvatar(data.avatar || "");
    setPhone(data.phone || "");
    setEmail(data.email || "");
    setAddress(data.address || "");
    setAge(data.age ? String(data.age) : "");
    setGender(data.gender || 1);
    setBirthday(data.birthday ? String(data.birthday) : "");
    setHeight(data.height ? String(data.height) : "");
    setWeight(data.weight ? String(data.weight) : "");
    setNote(data.note || "");

    if (data.sourceId && sourceOptions.length > 0) {
      const src = sourceOptions.find((s) => s.id === data.sourceId);
      setSelectedSource(src || null);
    }
  };

  // --- HANDLERS ---
  const handlePickImage = async () => {
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
      setUploading(true);
      try {
        const res = await uploadFile({ uri: asset.uri, name: asset.fileName || "avatar.jpg", type: asset.mimeType || "image/jpeg" } as any, token);
        if (res?.code === 200) setAvatar(res.result);
        else toast.show("Upload lỗi");
      } catch {
        toast.show("Lỗi mạng");
      }
      setUploading(false);
    }
  };

  const handlePickFile = async (attrId: number) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) {
      const asset = result.assets[0];
      const token = await getToken();
      if (!token) return;
      try {
        const res = await uploadFile({ uri: asset.uri, name: asset.name, type: asset.mimeType } as any, token);
        if (res?.code === 200) handleAttributeChange(attrId, res.result);
      } catch {}
    }
  };

  const handleAttributeChange = (attrId: number, val: string) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attrId]: { id: prev[attrId]?.id ?? null, value: val },
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ tên.");
      return;
    }

    setLoading(true);

    const customerExtraInfos = Object.keys(attributeValues).map((key) => {
      const attrId = Number(key);
      const entry = attributeValues[attrId];
      return {
        id: entry?.id || null,
        attributeId: attrId,
        attributeValue: entry?.value || "",
        customerId: item?.id,
      };
    });

    const payload: ICustomerRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      name,
      avatar,
      phone,
      email,
      address,
      note,
      birthday,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      gender,
      sourceId: selectedSource?.id,
      customerExtraInfos: customerExtraInfos.length > 0 ? customerExtraInfos : undefined,
    };

    await onSubmit(payload);
    setLoading(false);
  };

  // --- DYNAMIC RENDERER (FIXED KEY ERROR) ---
  const renderDynamicInput = (attr: ICustomerAttributeResponse) => {
    const val = attributeValues[attr.id]?.value || "";
    let options: any[] = [];
    try {
      options = attr.attributes ? JSON.parse(attr.attributes) : [];
    } catch {}

    const commonInputStyle = [styles.input, isDetail && styles.inputDisabled];

    switch (attr.datatype) {
      case "text":
      case "number":
      case "formula":
        return (
          <TextInput
            style={commonInputStyle}
            value={val}
            onChangeText={(t) => handleAttributeChange(attr.id, t)}
            editable={!isDetail && attr.datatype !== "formula"}
            placeholder={`Nhập ${attr.name}`}
            keyboardType={attr.datatype === "number" ? "numeric" : "default"}
          />
        );
      case "textarea":
        return (
          <TextInput
            style={[commonInputStyle, styles.textArea]}
            value={val}
            onChangeText={(t) => handleAttributeChange(attr.id, t)}
            editable={!isDetail}
            multiline
            placeholder={`Nhập ${attr.name}`}
          />
        );
      case "dropdown":
      case "select":
        const mappedOptions = options.map((opt: any) => ({
          id: opt.value,
          name: opt.label,
        }));

        return (
          <SelectCustom
            options={mappedOptions}
            value={val || undefined}
            onChange={(opt) => handleAttributeChange(attr.id, String(opt.id))}
            disabled={isDetail}
            placeholder={`Chọn ${attr.name}`}
          />
        );
      case "date":
        return <DatePickerCustom value={val} onConfirm={(d) => handleAttributeChange(attr.id, d.toISOString())} disabled={isDetail} label="" />;
      case "radio":
        return (
          <View style={styles.radioGroup}>
            {options.map((opt: any, idx: number) => (
              <TouchableOpacity key={idx} style={styles.radioItem} onPress={() => !isDetail && handleAttributeChange(attr.id, String(opt.value))}>
                <Ionicons name={val === String(opt.value) ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case "checkbox":
        return (
          <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && handleAttributeChange(attr.id, val === "1" ? "0" : "1")}>
            <Ionicons name={val === "1" ? "checkbox" : "square-outline"} size={22} color={COLORS.primary} />
            <Text style={styles.radioLabel}>{attr.name}</Text>
          </TouchableOpacity>
        );
      case "attachment":
        return (
          <View>
            {!isDetail && (
              <TouchableOpacity style={styles.attachmentBtn} onPress={() => handlePickFile(attr.id)}>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.info} />
                <Text style={styles.attachmentText}>Chọn file</Text>
              </TouchableOpacity>
            )}
            {val ? (
              <TouchableOpacity onPress={() => Linking.openURL(val)} style={{ marginTop: 8 }}>
                <Text style={{ color: COLORS.info, textDecorationLine: "underline" }}>Xem file đính kèm</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      default:
        return <TextInput style={commonInputStyle} value={val} onChangeText={(t) => handleAttributeChange(attr.id, t)} editable={!isDetail} />;
    }
  };

  if (!type) return null;

  if (type === "delete") {
    return (
      <Modal animationType="fade" transparent={true} visible={shown} onRequestClose={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.deleteContainer}>
              <Ionicons name="trash-outline" size={40} color={COLORS.danger} style={{ marginBottom: 16 }} />
              <Text style={styles.confirmText}>Xóa khách hàng {item?.name}?</Text>
              <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                  <Text style={{ fontWeight: "600" }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => {
                    setLoading(true);
                    onDelete && onDelete();
                  }}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>Xóa ngay</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" transparent={true} visible={shown} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={["top", "left", "right"]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{type === "add" ? "Thêm Khách Hàng" : type === "edit" ? "Sửa Khách Hàng" : "Chi Tiết"}</Text>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* 1. BASIC INFO */}
            <View style={styles.accordionItem}>
              <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpandBasic(!expandBasic)}>
                <View style={styles.iconBox}>
                  <Ionicons name="person-add-outline" size={18} color={COLORS.info} />
                </View>
                <Text style={styles.accordionTitle}>Thông tin cơ bản</Text>
                <Ionicons name={expandBasic ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textGray} />
              </TouchableOpacity>
              {expandBasic && (
                <View style={styles.accordionContent}>
                  {/* Avatar */}
                  <View style={styles.avatarSection}>
                    <View style={styles.avatarPreview}>
                      {uploading ? (
                        <ActivityIndicator color={COLORS.primary} />
                      ) : avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImg} />
                      ) : (
                        <Ionicons name="camera-outline" size={32} color={COLORS.textGray} />
                      )}
                    </View>
                    {!isDetail && (
                      <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
                        <Text style={styles.uploadText}>Chọn ảnh</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>
                        Họ tên <Text style={{ color: COLORS.danger }}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nhập họ tên"
                        placeholderTextColor={COLORS.textGray}
                        editable={!isDetail}
                      />
                    </View>
                  </View>
                  <View style={[styles.row, { marginTop: 12 }]}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Tuổi</Text>
                      <TextInput
                        style={styles.input}
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        placeholder="Nhập tuổi"
                        placeholderTextColor={COLORS.textGray}
                        editable={!isDetail}
                      />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.label}>Giới tính</Text>
                      <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
                        <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && setGender(1)}>
                          <Ionicons name={gender === 1 ? "radio-button-on" : "radio-button-off"} size={18} color={COLORS.primary} />
                          <Text>Nữ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.radioItem} onPress={() => !isDetail && setGender(2)}>
                          <Ionicons name={gender === 2 ? "radio-button-on" : "radio-button-off"} size={18} color={COLORS.primary} />
                          <Text>Nam</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View style={[{ marginTop: 12 }]}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Nguồn khách hàng</Text>
                      <SelectCustom
                        options={sourceOptions}
                        value={selectedSource?.id}
                        onChange={(opt) => setSelectedSource(opt)}
                        disabled={isDetail}
                        placeholder="Chọn nguồn khách hàng"
                      />
                    </View>
                    <View style={styles.formGroup}>
                      <DatePickerCustom label="Ngày sinh" value={birthday} onConfirm={(d) => setBirthday(d.toISOString())} disabled={isDetail} />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 2. ADDRESS INFO */}
            <View style={styles.accordionItem}>
              <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpandAddress(!expandAddress)}>
                <View style={[styles.iconBox, { backgroundColor: "#e0f2f1" }]}>
                  <Ionicons name="location-outline" size={18} color="#009688" />
                </View>
                <Text style={styles.accordionTitle}>Thông tin liên hệ</Text>
                <Ionicons name={expandAddress ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textGray} />
              </TouchableOpacity>
              {expandAddress && (
                <View style={styles.accordionContent}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Địa chỉ</Text>
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Nhập địa chỉ"
                      placeholderTextColor={COLORS.textGray}
                      editable={!isDetail}
                    />
                  </View>
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Số điện thoại</Text>
                      <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor={COLORS.textGray}
                        editable={!isDetail}
                      />
                    </View>
                    <View style={styles.col}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholder="Nhập email"
                        placeholderTextColor={COLORS.textGray}
                        editable={!isDetail}
                      />
                    </View>
                  </View>
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={note}
                      onChangeText={setNote}
                      multiline
                      placeholder="Ghi chú..."
                      placeholderTextColor={COLORS.textGray}
                      editable={!isDetail}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* 3. DYNAMIC ATTRIBUTES */}
            {attributes.length > 0 && (
              <View style={styles.accordionItem}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpandExtra(!expandExtra)}>
                  <View style={[styles.iconBox, { backgroundColor: "#fff3e0" }]}>
                    <Ionicons name="list-outline" size={18} color="#ff9800" />
                  </View>
                  <Text style={styles.accordionTitle}>Thông tin bổ sung</Text>
                  <Ionicons name={expandExtra ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textGray} />
                </TouchableOpacity>
                {expandExtra && (
                  <View style={styles.accordionContent}>
                    {attributes.map((attr) => (
                      <View key={attr.id} style={styles.formGroup}>
                        <Text style={styles.label}>
                          {attr.name} {attr.required ? <Text style={{ color: "red" }}>*</Text> : null}
                        </Text>
                        {renderDynamicInput(attr)}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.modalFooter}>
          {isDetail ? (
            <TouchableOpacity style={[styles.btnClose]} onPress={onClose}>
              <Text style={[styles.btnText, { color: COLORS.text }]}>Đóng</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                <Text style={[styles.btnText, { color: COLORS.text }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.btnText, { color: "#fff" }]}>{type === "add" ? "Tạo mới" : "Lưu"}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
