/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
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
  Linking, // Import Linking để mở link thanh toán
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "expo-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, COLORS } from "../Invoice.styles";

// Services
import InvoiceService from "../../../services/InvoiceService";
import CustomerService from "../../../services/CustomerService";
import ProductService from "../../../services/ProductService";
import BoughtProductService, { type IBoughtProductRequest } from "../../../services/BoughtProductService";
import ServiceService from "../../../services/ServiceService";
import BoughtServiceService, { type IBoughtServiceRequest } from "../../../services/BoughtServiceService";
import PaymentService from "../../../services/PaymentService"; // Bổ sung PaymentService

import { getToken } from "../../../utils/common";
import SelectCustom from "../../../components/SelectCustom/SelectCustom";

import type { IInvoiceRequest } from "../../../model/invoice/InvoiceRequestModel";
import type { IInvoiceResponse } from "../../../model/invoice/InvoiceResponseModel";

export type IInvoiceItem = {
  id: any;
  itemType: "product" | "service";
  productId?: any;
  serviceId?: any;
  productName?: string;
  serviceName?: string;
  productImage?: string;
  unitId?: number;
  qty: number;
  price: number;
  fee: number;
  note?: string;
  name?: string;
  avatar?: string;
};

type Props = {
  type: "add" | "edit" | "delete" | "detail" | null;
  shown: boolean;
  item?: IInvoiceResponse;
  onClose: () => void;
  onSubmit: (payload: IInvoiceRequest) => void;
  onDelete?: () => void;
};

const formatMoney = (val: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
};

export default function ModalInvoice({ type, shown, item, onClose, onSubmit, onDelete }: Props) {
  const toast = useToast();
  const token = getToken() || "";

  const [invoiceIdDisplay, setInvoiceIdDisplay] = useState<string>("");
  const [dbId, setDbId] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [apiTotalAmount, setApiTotalAmount] = useState<number>(0);

  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [items, setItems] = useState<IInvoiceItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const [date, setDate] = useState<string>(new Date().toISOString());
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // --- ACCORDION STATE ---
  const [expandCustomer, setExpandCustomer] = useState(true);
  const [expandItems, setExpandItems] = useState(true);
  const [expandPayment, setExpandPayment] = useState(true);

  const productOptions = useMemo(() => {
    return availableProducts.map((p) => ({
      id: p.id,
      name: `${p.name} - ${formatMoney(p.price || 0)}`,
      ...p,
    }));
  }, [availableProducts]);

  const serviceOptions = useMemo(() => {
    return availableServices.map((s) => ({
      id: s.id,
      name: `${s.name} - ${formatMoney(s.price || 0)}`,
      ...s,
    }));
  }, [availableServices]);

  const tempAmount = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.fee || 0), 0);
  }, [items]);

  // --- API CALLS ---
  const fetchMasterData = async () => {
    const t = await token;
    if (!t) return;
    try {
      const [prodRes, servRes, cusRes] = await Promise.all([
        ProductService.list({ page: 1, limit: 100 }, t),
        ServiceService.list({ page: 1, limit: 100 }, t),
        CustomerService.list({ page: 1, limit: 100 }, t),
      ]);

      if (prodRes?.code === 200) {
        setAvailableProducts(Array.isArray(prodRes.result) ? prodRes.result : prodRes.result.items || []);
      }
      if (servRes?.code === 200) {
        setAvailableServices(Array.isArray(servRes.result) ? servRes.result : servRes.result.items || []);
      }
      if (cusRes?.code === 200) {
        setCustomerOptions(Array.isArray(cusRes.result) ? cusRes.result : cusRes.result.items || []);
      }
    } catch (e) {
      console.error("Lỗi lấy dữ liệu:", e);
    }
  };

  const refreshInvoiceData = async (currentInvoiceId: number) => {
    const t = await token;
    if (!currentInvoiceId || !t) return;

    setLoadingItems(true);
    try {
      const [prodRes, servRes] = await Promise.all([
        BoughtProductService.list({ invoiceId: currentInvoiceId, status: 1 }, t),
        BoughtServiceService.list({ invoiceId: currentInvoiceId, status: 1 }, t),
      ]);

      let mergedItems: IInvoiceItem[] = [];
      if (prodRes?.code === 200) {
        const pList = Array.isArray(prodRes.result) ? prodRes.result : prodRes.result?.items || [];
        mergedItems = mergedItems.concat(pList.map((i: any) => ({ ...i, itemType: "product", name: i.productName, avatar: i.productImage })));
      }
      if (servRes?.code === 200) {
        const sList = Array.isArray(servRes.result) ? servRes.result : servRes.result?.items || [];
        mergedItems = mergedItems.concat(sList.map((i: any) => ({ ...i, itemType: "service", name: i.serviceName, avatar: "" })));
      }
      mergedItems.sort((a, b) => a.id - b.id);
      setItems(mergedItems);
    } catch (error) {
      console.error("Lỗi load items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const recalculateInvoice = async (currentInvoiceId: number) => {
    const t = await token;
    if (!currentInvoiceId || !t) return;
    const res = await InvoiceService.recalculate({ id: currentInvoiceId }, t);
    if (res?.code === 200) setApiTotalAmount(res.result.amount);
  };

  useEffect(() => {
    if (shown) {
      const isAdd = type === "add";
      setDbId(isAdd ? undefined : item?.id);
      setInvoiceIdDisplay(item?.invoiceCode || `INV${Date.now()}`);
      setApiTotalAmount(item?.amount || 0);
      setPaymentMethod(item?.paymentType === 2 ? 2 : 1);

      const rDate = item?.receiptDate ? String(item.receiptDate) : new Date().toISOString();
      setDate(rDate);
      setNotes(String(item?.note || ""));
      setItems([]);
      setDiscountAmount(item?.discount || 0);
      setVoucherCode(item?.voucherCode || "");

      if (type === "edit" && item) {
        const preFillCustomer = {
          id: item.customerId,
          name: item.customerName,
          phone: item.phone,
          email: item.email,
        };
        setSelectedCustomer(preFillCustomer);
        if (item.id) refreshInvoiceData(item.id);
      } else {
        setSelectedCustomer(null);
      }
      fetchMasterData();
    }
  }, [shown, type, item]);

  // --- HANDLERS ---

  const handleCustomerChange = async (option: any, shouldLoadDraft = true) => {
    if (!option) {
      setSelectedCustomer(null);
      setDbId(undefined);
      setItems([]);
      return;
    }
    setSelectedCustomer(option);

    const t = await token;
    if (shouldLoadDraft && t && option.id && type === "add") {
      const res = await InvoiceService.getDraft(option.id, t);
      if (res?.code === 200 && res.result) {
        const draft = res.result;
        setDbId(draft.id);
        setInvoiceIdDisplay(draft.invoiceCode);
        setApiTotalAmount(draft.amount);
        await refreshInvoiceData(draft.id);
        toast.show("Đã tải bản nháp gần nhất.");
      } else {
        setDbId(undefined);
        setItems([]);
        setApiTotalAmount(0);
      }
    }
  };

  const ensureDraftExists = async (): Promise<number | null> => {
    if (dbId) return dbId;
    if (!selectedCustomer) {
      Alert.alert("Lỗi", "Vui lòng chọn khách hàng trước.");
      return null;
    }
    const t = await token;
    if (!t) return null;

    setLoadingItems(true);
    try {
      const draftPayload: IInvoiceRequest = {
        id: 0,
        invoiceCode: invoiceIdDisplay,
        customerId: selectedCustomer.id,
        receiptDate: date,
        paymentType: paymentMethod,
        // Chuẩn hóa: 0 là Hóa đơn nháp
        status: 0,
        statusTemp: 0,
        amount: 0,
        discount: 0,
        fee: 0,
        paid: 0,
        debt: 0,
        userId: 0,
        branchId: 0,
        vatAmount: 0,
        amountCard: 0,
        note: "",
      };
      const res = await InvoiceService.update(draftPayload, t);
      if (res?.code === 200 && res.result) {
        const newId = typeof res.result === "object" ? res.result.id : res.result;
        setDbId(newId);
        return newId;
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddProductToDraft = async (prod: any) => {
    const targetId = await ensureDraftExists();
    if (!targetId) return;

    const t = await token;
    if (!t) return;

    const existing = items.find((it) => it.itemType === "product" && String(it.productId) === String(prod.id));
    const newQty = existing ? existing.qty + 1 : 1;

    const payload: IBoughtProductRequest = {
      id: existing?.id,
      invoiceId: targetId,
      productId: prod.id,
      unitId: prod.unitId || 1,
      qty: newQty,
      price: Number(prod.price),
      fee: Number(prod.price) * newQty,
      customerId: selectedCustomer?.id,
      status: 1,
      note: existing?.note || "",
    };

    setLoadingItems(true);
    const res = await BoughtProductService.update(payload, t);

    if (res?.code === 200) {
      await recalculateInvoice(targetId);
      await refreshInvoiceData(targetId);
    } else {
      toast.show(res?.message || "Không thể thêm sản phẩm");
    }
    setLoadingItems(false);
  };

  const handleAddServiceToDraft = async (serv: any) => {
    const targetId = await ensureDraftExists();
    if (!targetId) return;

    const t = await token;
    if (!t) return;

    const existing = items.find((it) => it.itemType === "service" && String(it.serviceId) === String(serv.id));
    const newQty = existing ? existing.qty + 1 : 1;

    const payload: IBoughtServiceRequest = {
      id: existing?.id,
      invoiceId: targetId,
      serviceId: serv.id,
      qty: newQty,
      price: Number(serv.price),
      fee: Number(serv.price) * newQty,
      customerId: selectedCustomer?.id,
      status: 1,
      note: existing?.note || "",
    };

    setLoadingItems(true);
    const res = await BoughtServiceService.update(payload, t);

    if (res?.code === 200) {
      await recalculateInvoice(targetId);
      await refreshInvoiceData(targetId);
    } else {
      toast.show(res?.message || "Không thể thêm dịch vụ");
    }
    setLoadingItems(false);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.show("Nhập mã voucher");
      return;
    }
    if (!dbId) {
      toast.show("Chưa có đơn hàng");
      return;
    }
    const t = await token;
    if (!t) return;
    try {
      const res = await InvoiceService.applyVoucher(dbId, voucherCode, tempAmount, t);
      if (res?.code === 200) {
        setDiscountAmount(res.result || 0);
        toast.show(`Giảm: ${formatMoney(res.result || 0)}`);
        await recalculateInvoice(dbId);
      } else {
        setDiscountAmount(0);
        toast.show(res?.message || "Voucher lỗi");
      }
    } catch (error) {
      setDiscountAmount(0);
    }
  };

  const confirmDelete = async (itemId: number, itemType: "product" | "service") => {
    const t = await token;
    if (!t) return;
    if (itemType === "product") await BoughtProductService.delete(itemId, t);
    else await BoughtServiceService.delete(itemId, t);
    if (dbId) {
      await recalculateInvoice(dbId);
      await refreshInvoiceData(dbId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer?.id) {
      toast.show("Vui lòng chọn khách hàng!");
      return;
    }
    setLoading(true);

    const safeTempAmount = tempAmount || 0;
    const safeDiscount = discountAmount || 0;
    const safeFee = finalAmount;

    // Chuẩn hóa: 1 là Hoàn thành (Tiền mặt), 0 là Nháp (Chờ chuyển khoản)
    const currentStatus = paymentMethod === 2 ? 0 : 1;

    const payload: IInvoiceRequest = {
      id: dbId,
      invoiceCode: invoiceIdDisplay,
      amount: safeTempAmount,
      discount: safeDiscount,
      fee: safeFee,
      vatAmount: 0,
      amountCard: 0,
      paid: 0,
      debt: 0,
      paymentType: paymentMethod === 2 ? 2 : 1,
      status: currentStatus,
      statusTemp: currentStatus,
      receiptDate: date,
      customerId: selectedCustomer.id,
      userId: 0,
      branchId: 0,
      voucherCode: voucherCode,
      note: notes,
    };

    if (paymentMethod === 2) {
      const t = await token;
      if (t) {
        // Cập nhật hóa đơn thành Nháp trước
        await InvoiceService.update(payload, t);
        // Lấy link thanh toán
        try {
          const payRes = await PaymentService.payment({ invoiceId: dbId, amount: safeFee }, t);
          if (payRes?.code === 200 && payRes.result) {
            Linking.openURL(payRes.result);
          } else {
            toast.show("Không thể lấy link thanh toán lúc này");
          }
        } catch (error) {
          console.error("Lỗi tạo thanh toán:", error);
        }
      }
      onSubmit(payload);
    } else {
      onSubmit(payload);
    }
    setLoading(false);
  };

  const finalAmount = useMemo(() => {
    const base = apiTotalAmount > 0 ? apiTotalAmount : tempAmount;
    return base - discountAmount > 0 ? base - discountAmount : 0;
  }, [apiTotalAmount, tempAmount, discountAmount]);

  const isViewOnly = type === "detail";
  const isDeleteMode = type === "delete";

  if (!type) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={shown} onRequestClose={onClose}>
      {isDeleteMode ? (
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: "auto", width: "90%", borderRadius: 16, backgroundColor: "#fff" }]}>
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
              <Text style={styles.confirmText}>Xóa hóa đơn này?</Text>
              <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                  <Text style={{ fontWeight: "600", color: COLORS.text }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => {
                    setLoading(true);
                    onDelete && onDelete();
                  }}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>Xóa ngay</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <SafeAreaView style={styles.modalContainer} edges={["top", "left", "right"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{type === "add" ? "Tạo Hóa Đơn" : type === "edit" ? "Cập Nhật" : "Chi Tiết"}</Text>
            <View style={{ width: 24 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" // Thêm thuộc tính này
            >
              {/* 1. CUSTOMER SECTION */}
              <View style={styles.accordionItem}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpandCustomer(!expandCustomer)}>
                  <View style={styles.iconBox}>
                    <Ionicons name="person-outline" size={18} color={COLORS.info} />
                  </View>
                  <Text style={styles.accordionTitle}>Khách hàng</Text>
                  <Ionicons name={expandCustomer ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textGray} />
                </TouchableOpacity>
                {expandCustomer && (
                  <View style={styles.accordionContent}>
                    {!selectedCustomer ? (
                      <SelectCustom
                        placeholder="Tìm khách hàng (Tên, SĐT)..."
                        options={customerOptions.map((c: any) => ({ id: c.id, name: `${c.name} - ${c.phone}` }))}
                        value={undefined}
                        onChange={(opt: any) => {
                          const fullCus = customerOptions.find((c: any) => String(c.id) === String(opt.id));
                          handleCustomerChange(fullCus || opt, true);
                        }}
                        disabled={isViewOnly || type === "edit"}
                      />
                    ) : (
                      <View style={[styles.customerCardNew, { marginBottom: 0 }]}>
                        <View style={styles.customerHeader}>
                          <View style={styles.customerAvatar}>
                            <Ionicons name="person" size={24} color={COLORS.info} />
                          </View>
                          <View>
                            <Text style={styles.customerNameLarge}>{selectedCustomer.name}</Text>
                            {/* <Text style={styles.customerCode}>ID: {selectedCustomer.id}</Text> */}
                          </View>
                          {!isViewOnly && type === "add" && (
                            <TouchableOpacity
                              style={styles.changeCustomerBtnAbs}
                              onPress={() => {
                                setSelectedCustomer(null);
                                setDbId(undefined);
                                setItems([]);
                              }}
                            >
                              <Text style={styles.changeBtnText}>Thay đổi</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={styles.customerDetailRow}>
                          <Ionicons name="call-outline" size={16} color={COLORS.textGray} />
                          <Text style={styles.customerDetailText}>{selectedCustomer.phone || "Chưa có SĐT"}</Text>
                        </View>
                        <View style={styles.customerDetailRow}>
                          <Ionicons name="mail-outline" size={16} color={COLORS.textGray} />
                          <Text style={styles.customerDetailText}>{selectedCustomer.email || "Chưa có Email"}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* 2. ITEMS SECTION */}
              <View style={styles.accordionItem}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpandItems(!expandItems)}>
                  <View style={[styles.iconBox, { backgroundColor: "#fff3e0" }]}>
                    <Ionicons name="cart-outline" size={18} color="#ff9800" />
                  </View>
                  <Text style={styles.accordionTitle}>Chi tiết đơn hàng</Text>
                  <Ionicons name={expandItems ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textGray} />
                </TouchableOpacity>
                {expandItems && (
                  <View style={styles.accordionContent}>
                    {!isViewOnly && (
                      <View style={styles.actionButtonsContainer}>
                        <View style={{ flex: 1 }}>
                          <SelectCustom
                            placeholder="+ Sản phẩm"
                            options={productOptions}
                            value={undefined}
                            onChange={(opt: any) => {
                              const p = availableProducts.find((i: any) => String(i.id) === String(opt.id));
                              if (p) handleAddProductToDraft(p);
                            }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <SelectCustom
                            placeholder="+ Dịch vụ"
                            options={serviceOptions}
                            value={undefined}
                            onChange={(opt: any) => {
                              const s = availableServices.find((i: any) => String(i.id) === String(opt.id));
                              if (s) handleAddServiceToDraft(s);
                            }}
                          />
                        </View>
                      </View>
                    )}

                    {loadingItems ? (
                      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : items.length > 0 ? (
                      items.map((itm) => (
                        <View key={`${itm.itemType}_${itm.id}`} style={[styles.itemCard, { marginBottom: 10 }]}>
                          <Image
                            source={{
                              uri: itm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(itm.name || "I")}&background=random`,
                            }}
                            style={styles.itemImage}
                          />
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={1}>
                              {itm.name || (itm.itemType === "product" ? itm.productName : itm.serviceName)}
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={styles.qtyBadge}>
                                  <Text style={styles.qtyText}>x{itm.qty}</Text>
                                </View>
                                <Text style={{ fontSize: 13, color: COLORS.textGray }}>Đơn giá: {formatMoney(itm.price)}</Text>
                              </View>
                              <Text style={styles.priceText}>{formatMoney(itm.fee)}</Text>
                            </View>
                          </View>
                          {!isViewOnly && (
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(itm.id, itm.itemType)}>
                              <Ionicons name="trash-outline" size={20} color={COLORS.textGray} />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color="#e0e0e0" />
                        <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* 3. PAYMENT & EXTRAS SECTION */}
              <View style={styles.accordionItem}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => setExpandPayment(!expandPayment)}>
                  <View style={[styles.iconBox, { backgroundColor: "#e8f5e9" }]}>
                    <Ionicons name="wallet-outline" size={18} color={COLORS.success} />
                  </View>
                  <Text style={styles.accordionTitle}>Thanh toán</Text>
                  <Ionicons name={expandPayment ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textGray} />
                </TouchableOpacity>
                {expandPayment && (
                  <View style={styles.accordionContent}>
                    <View style={[styles.summaryContainer, { borderWidth: 0, padding: 0, paddingBottom: 16 }]}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tạm tính</Text>
                        <Text style={styles.summaryValue}>{formatMoney(tempAmount)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Giảm giá</Text>
                        <Text style={[styles.summaryValue, { color: COLORS.success }]}>-{formatMoney(discountAmount)}</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                        <Text style={styles.totalValue}>{formatMoney(finalAmount)}</Text>
                      </View>
                    </View>

                    <View style={[styles.cardContainer, { borderWidth: 0, padding: 0, marginBottom: 0 }]}>
                      <View style={styles.voucherRow}>
                        <TextInput
                          style={styles.voucherInput}
                          placeholder="Mã giảm giá"
                          placeholderTextColor={COLORS.textGray}
                          value={voucherCode}
                          onChangeText={(t) => setVoucherCode(t.toUpperCase())}
                          editable={!isViewOnly}
                        />
                        {!isViewOnly && (
                          <TouchableOpacity style={styles.applyBtn} onPress={handleApplyVoucher} disabled={!dbId}>
                            <Text style={styles.applyBtnText}>Áp dụng</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.paymentRow}>
                        <TouchableOpacity
                          style={[styles.paymentOption, paymentMethod === 1 && styles.paymentOptionActive]}
                          onPress={() => !isViewOnly && setPaymentMethod(1)}
                        >
                          <Ionicons name="cash-outline" size={20} color={paymentMethod === 1 ? COLORS.primary : COLORS.textGray} />
                          <Text style={[styles.paymentText, paymentMethod === 1 && styles.paymentTextActive]}>Tiền mặt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.paymentOption, paymentMethod === 2 && styles.paymentOptionActive]}
                          onPress={() => !isViewOnly && setPaymentMethod(2)}
                        >
                          <Ionicons name="card-outline" size={20} color={paymentMethod === 2 ? COLORS.primary : COLORS.textGray} />
                          <Text style={[styles.paymentText, paymentMethod === 2 && styles.paymentTextActive]}>Chuyển khoản</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ height: 12 }} />
                      <TextInput
                        style={styles.inputMulti}
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                        editable={!isViewOnly}
                        placeholder="Ghi chú hóa đơn..."
                        placeholderTextColor={COLORS.textGray}
                      />
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {!isViewOnly && (
            <View style={[styles.bottomDock, { paddingBottom: Platform.OS === "ios" ? 40 : 24 }]}>
              <View style={styles.dockTotal}>
                <Text style={styles.dockLabel}>Tổng thanh toán</Text>
                <Text style={styles.dockValue}>{formatMoney(finalAmount)}</Text>
              </View>
              <TouchableOpacity style={styles.dockBtn} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.dockBtnText}>Thanh toán</Text>}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      )}
    </Modal>
  );
}
