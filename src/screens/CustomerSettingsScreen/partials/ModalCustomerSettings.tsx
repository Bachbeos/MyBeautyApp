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
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "../CustomerSettings.styles";
import CustomerAttributeService from "../../../services/CustomerAttributeService";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";
import { getToken } from "../../../utils/common";
import type { ICustomerAttributeResponse } from "../../../model/customerAttribute/CustomerAttributeResponseModel";
import type { ICustomerAttributeRequest } from "../../../model/customerAttribute/CustomerAttributeRequestModel";

type ModalType = "add" | "edit" | "delete" | "detail" | null;

interface ModalProps {
  type: ModalType;
  shown: boolean;
  item?: ICustomerAttributeResponse;
  onClose: () => void;
  onSubmit: (payload: ICustomerAttributeRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
}

interface DropdownOption {
  value: string;
  label: string;
}

const ModalCustomerSetting: React.FC<ModalProps> = ({ type, shown, item, onClose, onSubmit, onDelete }) => {
  const isDetail = type === "detail";
  const [loading, setLoading] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);

  const [name, setName] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [position, setPosition] = useState("");

  const [datatype, setDatatype] = useState<string>("number");
  const [required, setRequired] = useState<boolean>(false);
  const [readonly, setReadonly] = useState<boolean>(false);
  const [uniqued, setUniqued] = useState<boolean>(false);

  const [parentOptions, setParentOptions] = useState<ICustomerAttributeResponse[]>([]);
  const [selectedParent, setSelectedParent] = useState<ICustomerAttributeResponse | null>(null);

  const [numberFormat, setNumberFormat] = useState<string>("");
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([{ value: "", label: "" }]);
  const [detailLookup, setDetailLookup] = useState<string>("contract");
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [attributesText, setAttributesText] = useState<string>("");

  const numberFormatPresets = ["1,234", "1,234.5", "1,234.56", "1,234.567"];

  const datatypeOptions = [
    { id: "text", name: "Text (Văn bản)" },
    { id: "textarea", name: "Textarea (Văn bản nhiều dòng)" },
    { id: "number", name: "Number (Số)" },
    { id: "dropdown", name: "Dropdown (Danh sách chọn)" },
    { id: "multiselect", name: "Multiselect (Chọn nhiều)" },
    { id: "checkbox", name: "Checkbox" },
    { id: "radio", name: "Radio" },
    { id: "date", name: "Date (Ngày tháng)" },
    { id: "formula", name: "Formula (Công thức)" },
    { id: "attachment", name: "Attachment (Đính kèm)" },
  ];

  useEffect(() => {
    if ((type === "add" || type === "edit") && shown) {
      loadParentOptions();
    }
  }, [type, shown]);

  const loadParentOptions = async () => {
    const token = await getToken();
    if (!token) return;
    setLoadingParents(true);
    const res = await CustomerAttributeService.list({ page: 1, limit: 1000 }, token);
    if (res && res.code === 200 && res.result?.items) {
      setParentOptions(res.result.items);
    } else {
      setParentOptions([]);
    }
    setLoadingParents(false);
  };

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
    if (item && (type === "edit" || type === "detail") && parentOptions.length > 0) {
      const parent = parentOptions.find((p) => p.id === item.parentId);
      setSelectedParent(parent || null);
    }
  }, [parentOptions, item]);

  const resetForm = () => {
    setName("");
    setFieldName("");
    setPosition("0");
    setDatatype("number");
    setRequired(false);
    setReadonly(false);
    setUniqued(false);
    setSelectedParent(null);
    clearTypeSpecificStates("number");
  };

  const fillForm = (data: ICustomerAttributeResponse) => {
    setName(data.name || "");
    setFieldName(data.fieldName || "");
    setPosition(String(data.position || 0));

    const dt = String(data.datatype || "").toLowerCase();
    setDatatype(dt || "number");

    setRequired(data.required === 1);
    setReadonly(data.readonly === 1);
    setUniqued(data.uniqued === 1);

    const attrStr = data.attributes || "";
    clearTypeSpecificStates(dt);

    try {
      if (dt === "number") {
        const obj = attrStr ? JSON.parse(attrStr) : {};
        setNumberFormat(obj?.numberFormat ? String(obj.numberFormat) : "");
      } else if (["dropdown", "radio", "multiselect"].includes(dt)) {
        const arr = attrStr ? JSON.parse(attrStr) : [];
        if (Array.isArray(arr) && arr.length) {
          setDropdownOptions(arr.map((o: any) => ({ value: String(o?.value ?? ""), label: String(o?.label ?? "") })));
        }
      } else if (dt === "lookup") {
        const obj = attrStr ? JSON.parse(attrStr) : {};
        setDetailLookup(obj?.refType || "contract");
      } else if (dt === "formula") {
        const obj = attrStr ? JSON.parse(attrStr) : {};
        setSelectedFormula(obj?.formula || "");
      } else {
        setAttributesText(attrStr);
      }
    } catch (e) {
      // JSON parse error or empty, keep defaults
    }
  };

  const clearTypeSpecificStates = (v: string) => {
    setNumberFormat("");
    setDropdownOptions([{ value: "", label: "" }]);
    setDetailLookup("contract");
    setSelectedFormula("");
    setAttributesText("");
  };

  const buildAttributesString = (): string | undefined => {
    const dt = datatype?.toLowerCase();
    if (["dropdown", "radio", "multiselect"].includes(dt)) {
      const normalized = dropdownOptions.map((o) => ({ value: o.value.trim(), label: o.label.trim() })).filter((o) => o.value || o.label);
      return normalized.length ? JSON.stringify(normalized) : undefined;
    }
    if (dt === "number") {
      return numberFormat ? JSON.stringify({ numberFormat }) : undefined;
    }
    if (dt === "formula") {
      return selectedFormula ? JSON.stringify({ formula: selectedFormula }) : undefined;
    }
    return attributesText.trim() || undefined;
  };

  const handleSubmit = async () => {
    if (type === "delete" && onDelete) {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!name.trim() || !fieldName.trim()) {
      alert("Vui lòng nhập Tên và Mã trường (*)");
      return;
    }

    const payload: ICustomerAttributeRequest = {
      ...(item?.id ? { id: item.id } : {}),
      name: name.trim(),
      fieldName: fieldName.trim(),
      datatype: datatype.toLowerCase(),
      position: Number(position) || 0,
      parentId: selectedParent?.id,
      required: required ? 1 : 0,
      readonly: readonly ? 1 : 0,
      uniqued: uniqued ? 1 : 0,
      attributes: buildAttributesString(),
    };

    setLoading(true);
    await onSubmit(payload);
    setLoading(false);
  };

  const renderLabel = (text: string, req = false) => (
    <Text style={styles.label}>
      {text} {req && <Text style={{ color: COLORS.danger }}>*</Text>}
    </Text>
  );

  const isDeleteMode = type === "delete";

  return (
    <Modal animationType="fade" transparent={true} visible={shown} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={styles.modalView} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {type === "add"
                    ? "Thêm trường thông tin"
                    : type === "edit"
                      ? "Cập nhật trường thông tin"
                      : isDeleteMode
                        ? "Xóa trường thông tin"
                        : "Chi tiết"}
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
                <Text style={styles.confirmText}>Bạn có chắc muốn xóa "{item?.name}"?</Text>
                <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* --- BASIC INFO --- */}
                <View>
                  <View style={styles.formGroup}>
                    {renderLabel("Tên trường dữ liệu", true)}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={name}
                      onChangeText={setName}
                      editable={!isDetail}
                      placeholder="Tên trường dữ liệu"
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Mã trường dữ liệu", true)}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={fieldName}
                      onChangeText={setFieldName}
                      editable={!isDetail}
                      placeholder="Mã trường dữ liệu"
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { marginTop: 12 }]}>
                  {renderLabel("Kiểu dữ liệu", true)}
                  <SelectCustom
                    options={datatypeOptions}
                    value={datatype}
                    onChange={(opt) => {
                      setDatatype(String(opt.id));
                      clearTypeSpecificStates(String(opt.id));
                    }}
                    disabled={isDetail}
                    placeholder="Chọn kiểu dữ liệu"
                  />
                </View>

                <View style={styles.col}>
                  {renderLabel("Thuộc nhóm")}
                  <SelectCustom
                    options={parentOptions.map((p) => ({ id: p.id, name: p.name }))}
                    value={selectedParent?.id}
                    onChange={(opt) => {
                      const p = parentOptions.find((i) => i.id === opt.id);
                      setSelectedParent(p || null);
                    }}
                    disabled={isDetail}
                    placeholder="Chọn nhóm cha"
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    {renderLabel("Thứ tự")}
                    <TextInput
                      style={[styles.input, isDetail && styles.inputDisabled]}
                      value={position}
                      onChangeText={setPosition}
                      keyboardType="numeric"
                      editable={!isDetail}
                      placeholder="0"
                    />
                  </View>
                </View>

                {datatype !== "formula" && (
                  <View style={{ marginTop: 16 }}>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Bắt buộc nhập?</Text>
                      <Switch value={required} onValueChange={setRequired} trackColor={{ false: "#ccc", true: COLORS.primary }} disabled={isDetail} />
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Dữ liệu duy nhất?</Text>
                      <Switch value={uniqued} onValueChange={setUniqued} trackColor={{ false: "#ccc", true: COLORS.primary }} disabled={isDetail} />
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.switchLabel}>Chỉ đọc (Readonly)?</Text>
                      <Switch value={readonly} onValueChange={setReadonly} trackColor={{ false: "#ccc", true: COLORS.primary }} disabled={isDetail} />
                    </View>
                  </View>
                )}

                <View style={{ marginTop: 8 }}>
                  {datatype === "number" && (
                    <View>
                      {renderLabel("Định dạng số")}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                        {numberFormatPresets.map((fmt) => (
                          <TouchableOpacity
                            key={fmt}
                            style={[styles.radioItem, { marginBottom: 8 }]}
                            onPress={() => !isDetail && setNumberFormat(fmt)}
                          >
                            <Ionicons name={numberFormat === fmt ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                            <Text style={styles.radioLabel}>{fmt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {["dropdown", "radio", "multiselect"].includes(datatype) && (
                    <View>
                      {renderLabel("Danh sách lựa chọn")}
                      <View style={styles.optionListContainer}>
                        {dropdownOptions.map((opt, idx) => (
                          <View key={idx} style={styles.optionRow}>
                            <TextInput
                              style={[styles.optionInput, { flex: 0.4 }]}
                              placeholder="Giá trị (Value)"
                              value={opt.value}
                              onChangeText={(t) => {
                                const newOpts = [...dropdownOptions];
                                newOpts[idx].value = t;
                                setDropdownOptions(newOpts);
                              }}
                              editable={!isDetail}
                            />
                            <TextInput
                              style={[styles.optionInput, { flex: 0.6 }]}
                              placeholder="Nhãn (Label)"
                              value={opt.label}
                              onChangeText={(t) => {
                                const newOpts = [...dropdownOptions];
                                newOpts[idx].label = t;
                                setDropdownOptions(newOpts);
                              }}
                              editable={!isDetail}
                            />
                            {!isDetail && (
                              <TouchableOpacity
                                style={styles.deleteOptionBtn}
                                onPress={() => {
                                  const newOpts = dropdownOptions.filter((_, i) => i !== idx);
                                  setDropdownOptions(newOpts.length ? newOpts : [{ value: "", label: "" }]);
                                }}
                              >
                                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                        {!isDetail && (
                          <TouchableOpacity
                            style={styles.addOptionBtn}
                            onPress={() => setDropdownOptions([...dropdownOptions, { value: "", label: "" }])}
                          >
                            <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                            <Text style={styles.addOptionText}> Thêm lựa chọn</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {datatype === "formula" && (
                    <View>
                      {renderLabel("Công thức tính")}
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        value={selectedFormula}
                        onChangeText={setSelectedFormula}
                        placeholder="Nhập công thức..."
                        editable={!isDetail}
                      />
                    </View>
                  )}
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                <Text style={[styles.textStyle, { color: COLORS.text }]}>{isDetail ? "Đóng" : "Hủy"}</Text>
              </TouchableOpacity>
              {!isDetail && (
                <TouchableOpacity
                  style={[styles.button, isDeleteMode ? styles.buttonDelete : styles.buttonSave]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={[styles.textStyle, { color: "white" }]}>{isDeleteMode ? "Xóa ngay" : type === "add" ? "Tạo mới" : "Lưu"}</Text>
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

export default ModalCustomerSetting;
