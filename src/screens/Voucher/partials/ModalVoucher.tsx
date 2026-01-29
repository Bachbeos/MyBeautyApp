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
import { styles, COLORS } from "../Voucher.styles";
import { IVoucherResponse } from "../../../model/voucher/VoucherResponseModel";
import { IVoucherRequest } from "../../../model/voucher/VoucherRequestModel";
import BranchService from "../../../services/BranchService";
import { getToken } from "../../../utils/common";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";
import DatePickerCustom from "../../../components/DatePicker/DatePickerCustom";

interface SelectOption {
  id: number;
  name: string;
  [key: string]: any;
}

interface ModalVoucherProps {
  shown: boolean;
  type: "add" | "edit" | "delete" | "detail" | null;
  item?: IVoucherResponse | null;
  onClose: () => void;
  onSubmit: (data: IVoucherRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const ModalVoucher: React.FC<ModalVoucherProps> = ({ shown, type, item, onClose, onSubmit, onDelete }) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<number>(1);
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minInvoiceAmount, setMinInvoiceAmount] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("100");
  const [usageQuantity, setUsageQuantity] = useState("100");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(1);
  const [description, setDescription] = useState("");
  const [branchOptions, setBranchOptions] = useState<SelectOption[]>([]);
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shown && (type === "add" || type === "edit")) {
      const fetchBranches = async () => {
        const token = await getToken();
        if (!token) return;
        const res = await BranchService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          const allOption = { id: 0, name: "Toàn hệ thống (Mặc định)" };
          const formattedBranches = res.result.items.map((b: any) => ({
            id: b.id,
            name: b.name,
          }));
          setBranchOptions([allOption, ...formattedBranches]);
        }
      };
      fetchBranches();
    }
  }, [shown, type]);

  useEffect(() => {
    if (shown) {
      if ((type === "edit" || type === "detail") && item) {
        setCode(item.code || "");
        setName(item.name || "");
        setDiscountType(item.discountType || 1);
        setDiscountValue(item.discountValue ? String(item.discountValue) : "");
        setMaxDiscount(item.maxDiscount ? String(item.maxDiscount) : "");
        setMinInvoiceAmount(item.minInvoiceAmount ? String(item.minInvoiceAmount) : "0");
        setTotalQuantity(item.totalQuantity ? String(item.totalQuantity) : "100");
        setUsageQuantity(item.usageQuantity ? String(item.usageQuantity) : "100");
        setPerUserLimit(item.perUserLimit ? String(item.perUserLimit) : "1");
        setStartDate(item.startDate || "");
        setEndDate(item.endDate || "");
        setStatus(item.status ?? 1);
        setDescription(item.description || "");
        setBranchId(item.branchId ? Number(item.branchId) : 0);
      } else if (type === "add") {
        resetForm();
      }
    }
  }, [shown, type, item]);

  const resetForm = () => {
    setCode("");
    setName("");
    setDiscountType(1);
    setDiscountValue("");
    setMaxDiscount("");
    setMinInvoiceAmount("0");
    setTotalQuantity("100");
    setUsageQuantity("100");
    setPerUserLimit("1");
    setStartDate("");
    setEndDate("");
    setStatus(1);
    setDescription("");
    setBranchId(0);
  };

  const handleSubmit = async () => {
    if (type === "delete") {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!code.trim() || !name.trim() || !discountValue || !startDate || !endDate) {
      alert("Vui lòng nhập các trường bắt buộc (*)");
      return;
    }

    const payload: IVoucherRequest = {
      ...(type === "edit" && item ? { id: item.id } : {}),
      code,
      name,
      description,
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: discountType === 2 ? Number(maxDiscount || 0) : 0,
      minInvoiceAmount: Number(minInvoiceAmount),
      totalQuantity: Number(totalQuantity),
      perUserLimit: Number(perUserLimit),
      startDate,
      endDate,
      status,
      branchId: branchId && branchId !== 0 ? branchId : undefined,
      usageQuantity: Number(usageQuantity),
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

  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

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
                  {type === "add" ? "Thêm voucher" : type === "edit" ? "Cập nhật" : isDeleteMode ? "Xóa voucher" : "Chi tiết"}
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
                <View style={styles.formGroup}>
                  {renderLabel("Mã voucher", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập mã voucher"
                    placeholderTextColor={COLORS.textGray}
                    value={code}
                    onChangeText={(t) => setCode(t.toUpperCase())}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Tên chương trình", true)}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="Nhập tên chương trình"
                    placeholderTextColor={COLORS.textGray}
                    value={name}
                    onChangeText={setName}
                    editable={!isViewOnly}
                  />
                </View>

                <View style={styles.formGroup}>
                  {renderLabel("Loại giảm giá")}
                  <View style={styles.radioContainer}>
                    <TouchableOpacity style={styles.radioItem} onPress={() => !isViewOnly && setDiscountType(1)} disabled={isViewOnly}>
                      <Ionicons name={discountType === 1 ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                      <Text style={{ color: COLORS.text }}>Tiền (VNĐ)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioItem} onPress={() => !isViewOnly && setDiscountType(2)} disabled={isViewOnly}>
                      <Ionicons name={discountType === 2 ? "radio-button-on" : "radio-button-off"} size={20} color={COLORS.primary} />
                      <Text style={{ color: COLORS.text }}>Phần trăm (%)</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    {renderLabel("Giá trị giảm", true)}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      placeholder="0"
                      keyboardType="numeric"
                      value={discountValue}
                      onChangeText={setDiscountValue}
                      editable={!isViewOnly}
                    />
                  </View>
                  {discountType === 2 && (
                    <View style={styles.col}>
                      {renderLabel("Giảm tối đa")}
                      <TextInput
                        style={[styles.input, isViewOnly && styles.inputDisabled]}
                        placeholder="0"
                        keyboardType="numeric"
                        value={maxDiscount}
                        onChangeText={setMaxDiscount}
                        editable={!isViewOnly}
                      />
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, { marginTop: 12 }]}>
                  {renderLabel("Đơn tối thiểu")}
                  <TextInput
                    style={[styles.input, isViewOnly && styles.inputDisabled]}
                    placeholder="0"
                    keyboardType="numeric"
                    value={minInvoiceAmount}
                    onChangeText={setMinInvoiceAmount}
                    editable={!isViewOnly}
                  />
                </View>

                <SelectCustom
                  label="Áp dụng chi nhánh"
                  options={branchOptions}
                  value={branchId}
                  onChange={(opt) => setBranchId(Number(opt.id))}
                  disabled={isViewOnly}
                  placeholder="Chọn chi nhánh"
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    {renderLabel("Tổng lượt")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      keyboardType="numeric"
                      value={totalQuantity}
                      onChangeText={setTotalQuantity}
                      editable={!isViewOnly}
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Còn lại")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      keyboardType="numeric"
                      value={usageQuantity}
                      onChangeText={setUsageQuantity}
                      editable={!isViewOnly}
                    />
                  </View>
                  <View style={styles.col}>
                    {renderLabel("Giới hạn/User")}
                    <TextInput
                      style={[styles.input, isViewOnly && styles.inputDisabled]}
                      keyboardType="numeric"
                      value={perUserLimit}
                      onChangeText={setPerUserLimit}
                      editable={!isViewOnly}
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { marginTop: 12 }]}>
                  <DatePickerCustom
                    label="Thời gian bắt đầu"
                    required
                    value={startDate}
                    disabled={isViewOnly}
                    onConfirm={(date) => setStartDate(formatDateForApi(date))}
                    placeholder="Chọn ngày bắt đầu"
                  />
                </View>

                <View style={styles.formGroup}>
                  <DatePickerCustom
                    label="Thời gian kết thúc"
                    required
                    value={endDate}
                    disabled={isViewOnly}
                    onConfirm={(date) => setEndDate(formatDateForApi(date))}
                    placeholder="Chọn ngày kết thúc"
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

                <View style={styles.formGroup}>
                  {renderLabel("Mô tả")}
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }, isViewOnly && styles.inputDisabled]}
                    placeholder="Mô tả chi tiết..."
                    placeholderTextColor={COLORS.textGray}
                    multiline={true}
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
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
                  disabled={loading}
                >
                  {loading ? (
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

export default ModalVoucher;
