/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment, useEffect, useMemo, useState } from "react";
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
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "expo-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles, COLORS } from "../Invoice.styles";

import InvoiceService from "../../../services/InvoiceService";
import CustomerService from "../../../services/CustomerService";
import ProductService from "../../../services/ProductService";
import BoughtProductService, { type IBoughtProductRequest } from "../../../services/BoughtProductService";
import ServiceService from "../../../services/ServiceService";
import BoughtServiceService, { type IBoughtServiceRequest } from "../../../services/BoughtServiceService";
import PaymentService from "../../../services/PaymentService";

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

const formatMoney = (val: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

async function getAuthToken() {
  return (await getToken()) || "";
}

/** =========================
 * DeleteModal (giống web)
 * ========================= */
function DeleteModal({ shown, onClose, onDelete }: { shown: boolean; onClose: () => void; onDelete?: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!shown) return null;

  return (
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
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={loading}>
              <Text style={{ fontWeight: "600", color: COLORS.text }}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnDelete}
              disabled={loading}
              onPress={async () => {
                try {
                  setLoading(true);
                  await onDelete?.();
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>Xóa ngay</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

/** =========================
 * FormModal (giống web OffcanvasForm)
 * - mode: add/edit
 * - logic giống web 1-1
 * ========================= */
function FormModal({
  mode,
  shown,
  item,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  shown: boolean;
  item?: IInvoiceResponse;
  onClose: () => void;
  onSubmit: (payload: IInvoiceRequest) => void;
}) {
  const toast = useToast();

  // --- BASIC FORM STATE (giống web) ---
  const [invoiceIdDisplay, setInvoiceIdDisplay] = useState<string>("");
  const [dbId, setDbId] = useState<number | undefined>(undefined);

  const [paymentMethod, setPaymentMethod] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [apiTotalAmount, setApiTotalAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString());

  // --- MASTER DATA ---
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  // --- ITEMS ---
  const [items, setItems] = useState<IInvoiceItem[]>([]);
  const [deleteData, setDeleteData] = useState<{ id: number; type: "product" | "service" } | null>(null);

  // --- VOUCHER ---
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // --- LOADING ---
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // --- ACCORDION UI STATE (giữ UI mobile) ---
  const [expandCustomer, setExpandCustomer] = useState(true);
  const [expandItems, setExpandItems] = useState(true);
  const [expandPayment, setExpandPayment] = useState(true);

  // --- SELECT STATE (giống web selectedProductToAdd/selectedServiceToAdd) ---
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<any>(null);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<any>(null);

  const productOptions = useMemo(() => {
    return availableProducts.map((p) => ({
      ...p,
      id: p.id,
      name: `${p.name} - ${formatMoney(p.price || 0)}`,
    }));
  }, [availableProducts]);

  const serviceOptions = useMemo(() => {
    return availableServices.map((s) => ({
      ...s,
      id: s.id,
      name: `${s.name} - ${formatMoney(s.price || 0)}`,
    }));
  }, [availableServices]);

  const tempAmount = useMemo(() => items.reduce((acc, curr) => acc + (curr.fee || 0), 0), [items]);

  // UI tổng cộng giống web: (apiTotalAmount || 0) - discount
  const finalAmount = useMemo(() => {
    const v = (apiTotalAmount || 0) - (discountAmount || 0);
    return v > 0 ? v : 0;
  }, [apiTotalAmount, discountAmount]);

  // --- API ---
  const fetchMasterData = async () => {
    const t = await getAuthToken();
    if (!t) return;

    try {
      const [prodRes, servRes, cusRes] = await Promise.all([
        ProductService.list({ page: 1, limit: 100 }, t),
        ServiceService.list({ page: 1, limit: 100 }, t),
        CustomerService.list({ page: 1, limit: 100 }, t),
      ]);

      if (prodRes?.code === 200) setAvailableProducts(Array.isArray(prodRes.result) ? prodRes.result : prodRes.result.items || []);
      if (servRes?.code === 200) setAvailableServices(Array.isArray(servRes.result) ? servRes.result : servRes.result.items || []);
      if (cusRes?.code === 200) setCustomerOptions(Array.isArray(cusRes.result) ? cusRes.result : cusRes.result.items || []);
    } catch (e) {
      console.error("fetchMasterData error", e);
    }
  };

  const refreshInvoiceData = async (currentInvoiceId: number) => {
    const t = await getAuthToken();
    if (!currentInvoiceId || !t) return;

    setLoadingItems(true);
    try {
      const [prodRes, servRes] = await Promise.all([
        BoughtProductService.list({ invoiceId: currentInvoiceId, status: 1 }, t),
        BoughtServiceService.list({ invoiceId: currentInvoiceId, status: 1 }, t),
      ]);

      let merged: IInvoiceItem[] = [];
      if (prodRes?.code === 200) {
        const pList = Array.isArray(prodRes.result) ? prodRes.result : prodRes.result?.items || [];
        merged = merged.concat(pList.map((i: any) => ({ ...i, itemType: "product", name: i.productName, avatar: i.productImage })));
      }
      if (servRes?.code === 200) {
        const sList = Array.isArray(servRes.result) ? servRes.result : servRes.result?.items || [];
        merged = merged.concat(sList.map((i: any) => ({ ...i, itemType: "service", name: i.serviceName, avatar: "" })));
      }

      merged.sort((a, b) => a.id - b.id);
      setItems(merged);
    } catch (e) {
      console.error("refreshInvoiceData error", e);
    } finally {
      setLoadingItems(false);
    }
  };

  const recalculateInvoice = async (currentInvoiceId: number) => {
    const t = await getAuthToken();
    if (!currentInvoiceId || !t) return;

    const res = await InvoiceService.recalculate({ id: currentInvoiceId }, t);
    if (res?.code === 200) setApiTotalAmount(res.result.amount);
  };

  // --- lifecycle: giống web useEffect(shown, mode, item) ---
  useEffect(() => {
    if (!shown) return;

    // reset giống web
    setDbId(mode === "add" ? undefined : item?.id);
    setInvoiceIdDisplay(item?.invoiceCode || `INV${Date.now()}`);
    setApiTotalAmount(item?.amount || 0);
    setPaymentMethod(item?.paymentType === 2 ? 2 : 1);

    const rDate = item?.receiptDate ? String(item.receiptDate) : new Date().toISOString();
    setDate(rDate);

    setNotes(String(item?.note || ""));
    setItems([]);
    setSelectedProductToAdd(null);
    setSelectedServiceToAdd(null);
    setDeleteData(null);

    setDiscountAmount(item?.discount || 0);
    setVoucherCode(item?.voucherCode || "");

    if (mode === "edit" && item) {
      const preFillCustomer = { id: item.customerId, name: item.customerName, phone: item.phone, email: item.email };
      setSelectedCustomer(preFillCustomer);
      if (item.id) refreshInvoiceData(item.id);
    } else {
      setSelectedCustomer(null);
    }

    fetchMasterData();
  }, [shown, mode, item]);

  // --- handlers giống web ---
  const handleCustomerChange = async (option: any, shouldLoadDraft = true) => {
    setSelectedCustomer(option);

    if (!option) {
      setDbId(undefined);
      setItems([]);
      setApiTotalAmount(0);
      return;
    }

    if (shouldLoadDraft && option.id && mode === "add") {
      const t = await getAuthToken();
      if (!t) return;

      const res = await InvoiceService.getDraft(option.id, t);
      if (res?.code === 200 && res.result) {
        const draft = res.result;
        setDbId(draft.id);
        setInvoiceIdDisplay(draft.invoiceCode);
        setApiTotalAmount(draft.amount);
        await refreshInvoiceData(draft.id);
      } else {
        setDbId(undefined);
        setItems([]);
        setApiTotalAmount(0);
      }
    }
  };

  const handleAddProductToDraft = async () => {
    if (!selectedProductToAdd) return toast.show("Chưa chọn sản phẩm!");
    if (!dbId) return toast.show("Chưa có khách hàng (hoặc chưa lưu nháp)!");

    const t = await getAuthToken();
    if (!t) return;

    const existing = items.find((it) => it.itemType === "product" && String(it.productId) === String(selectedProductToAdd.id));

    const payload: IBoughtProductRequest = {
      id: existing?.id,
      invoiceId: dbId,
      productId: selectedProductToAdd.id,
      unitId: selectedProductToAdd.unitId || 1,
      qty: existing ? existing.qty + 1 : 1,
      price: selectedProductToAdd.price,
      fee: selectedProductToAdd.price * (existing ? existing.qty + 1 : 1),
      customerId: selectedCustomer?.id,
      status: 1,
      note: existing?.note || "",
    };

    setLoadingItems(true);
    try {
      const res = await BoughtProductService.update(payload, t);
      if (res?.code === 200) {
        await recalculateInvoice(dbId);
        await refreshInvoiceData(dbId);
        setSelectedProductToAdd(null); // giống web reset select
      } else {
        toast.show(res?.message || "Không thể thêm sản phẩm");
      }
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddServiceToDraft = async () => {
    if (!selectedServiceToAdd) return toast.show("Chưa chọn dịch vụ!");
    if (!dbId) return toast.show("Chưa có khách hàng!");

    const t = await getAuthToken();
    if (!t) return;

    const existing = items.find((it) => it.itemType === "service" && String(it.serviceId) === String(selectedServiceToAdd.id));

    const payload: IBoughtServiceRequest = {
      id: existing?.id,
      invoiceId: dbId,
      serviceId: selectedServiceToAdd.id,
      qty: existing ? existing.qty + 1 : 1,
      price: selectedServiceToAdd.price,
      fee: selectedServiceToAdd.price * (existing ? existing.qty + 1 : 1),
      customerId: selectedCustomer?.id,
      status: 1,
      note: existing?.note || "",
    };

    setLoadingItems(true);
    try {
      const res = await BoughtServiceService.update(payload, t);
      if (res?.code === 200) {
        await recalculateInvoice(dbId);
        await refreshInvoiceData(dbId);
        setSelectedServiceToAdd(null);
      } else {
        toast.show(res?.message || "Không thể thêm dịch vụ");
      }
    } finally {
      setLoadingItems(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.show("Vui lòng nhập mã giảm giá!");
      return;
    }
    if (!dbId) {
      toast.show("Vui lòng chọn khách hàng và tạo đơn nháp trước!");
      return;
    }

    const t = await getAuthToken();
    if (!t) return;

    try {
      const res = await InvoiceService.applyVoucher(dbId, voucherCode, tempAmount, t);
      if (res?.code === 200) {
        const returnedDiscount = res.result || 0;
        setDiscountAmount(returnedDiscount);
        toast.show(`Giảm: ${formatMoney(returnedDiscount)}`);
        await recalculateInvoice(dbId);
      } else {
        setDiscountAmount(0);
        toast.show(res?.message || "Không thể áp dụng mã voucher này.");
      }
    } catch (e) {
      setDiscountAmount(0);
      toast.show("Có lỗi xảy ra khi áp dụng mã.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteData) return;

    const t = await getAuthToken();
    if (!t) return;

    if (deleteData.type === "product") await BoughtProductService.delete(deleteData.id, t);
    else await BoughtServiceService.delete(deleteData.id, t);

    setDeleteData(null);

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

    // web flow cần dbId (đặc biệt chuyển khoản)
    if (!dbId) {
      toast.show("Vui lòng chọn khách hàng và tạo đơn nháp trước!");
      return;
    }

    setLoading(true);

    const safeTempAmount = tempAmount || 0;
    const safeDiscount = discountAmount || 0;
    const finalTotal = safeTempAmount - safeDiscount;
    const safeFee = finalTotal > 0 ? finalTotal : 0;
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
      statusTemp: 1, // giống web
      receiptDate: date,
      customerId: selectedCustomer.id,
      userId: 0,
      branchId: 0,
      voucherCode: voucherCode,
      note: notes,
    };

    try {
      const t = await getAuthToken();
      if (!t) return;

      if (paymentMethod === 2) {
        // giống web: update trước rồi payment rồi mở link, không gọi onSubmit
        try {
          await InvoiceService.update(payload, t);
        } catch (e) {
          console.error("Update invoice before payment error", e);
        }

        toast.show("Đang khởi tạo giao dịch chuyển khoản...");
        const res = await PaymentService.payment({ invoiceId: dbId, amount: safeFee }, t);
        if (res?.code === 200 && res.result) {
          await Linking.openURL(res.result);
        } else {
          toast.show(res?.message || "Không lấy được đường dẫn thanh toán. Vui lòng thử lại.");
        }
        return;
      }

      // tiền mặt: giống web gọi onSubmit(payload)
      onSubmit(payload);
    } catch (e) {
      console.error("handleSubmit error", e);
      toast.show("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI (giữ như mobile hiện tại)
  // =========================

  return (
    <SafeAreaView style={styles.modalContainer} edges={["top", "left", "right"]}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{mode === "add" ? "Tạo Hóa Đơn" : "Cập Nhật"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                    disabled={mode === "edit"}
                  />
                ) : (
                  <View style={[styles.customerCardNew, { marginBottom: 0 }]}>
                    <View style={styles.customerHeader}>
                      <View style={styles.customerAvatar}>
                        <Ionicons name="person" size={24} color={COLORS.info} />
                      </View>
                      <View>
                        <Text style={styles.customerNameLarge}>{selectedCustomer.name}</Text>
                      </View>

                      {mode === "add" && (
                        <TouchableOpacity
                          style={styles.changeCustomerBtnAbs}
                          onPress={() => {
                            setSelectedCustomer(null);
                            setDbId(undefined);
                            setItems([]);
                            setApiTotalAmount(0);
                            setDiscountAmount(0);
                            setVoucherCode("");
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
                {/* Giống web: chọn + bấm nút add */}
                <View style={styles.actionButtonsContainer}>
                  <View style={{ flex: 1 }}>
                    <SelectCustom
                      placeholder="+ Sản phẩm"
                      options={productOptions}
                      value={selectedProductToAdd}
                      onChange={(opt: any) => setSelectedProductToAdd(opt)}
                    />
                    <TouchableOpacity
                      style={[styles.applyBtn, { marginTop: 8, opacity: !selectedProductToAdd || !dbId ? 0.5 : 1 }]}
                      disabled={!selectedProductToAdd || !dbId}
                      onPress={handleAddProductToDraft}
                    >
                      <Text style={styles.applyBtnText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    <SelectCustom
                      placeholder="+ Dịch vụ"
                      options={serviceOptions}
                      value={selectedServiceToAdd}
                      onChange={(opt: any) => setSelectedServiceToAdd(opt)}
                    />
                    <TouchableOpacity
                      style={[styles.applyBtn, { marginTop: 8, opacity: !selectedServiceToAdd || !dbId ? 0.5 : 1 }]}
                      disabled={!selectedServiceToAdd || !dbId}
                      onPress={handleAddServiceToDraft}
                    >
                      <Text style={styles.applyBtnText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>

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

                      <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteData({ id: itm.id, type: itm.itemType })}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.textGray} />
                      </TouchableOpacity>
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

          {/* 3. PAYMENT SECTION */}
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
                    />
                    <TouchableOpacity style={styles.applyBtn} onPress={handleApplyVoucher} disabled={!dbId}>
                      <Text style={styles.applyBtnText}>Áp dụng</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.paymentRow}>
                    <TouchableOpacity
                      style={[styles.paymentOption, paymentMethod === 1 && styles.paymentOptionActive]}
                      onPress={() => setPaymentMethod(1)}
                    >
                      <Ionicons name="cash-outline" size={20} color={paymentMethod === 1 ? COLORS.primary : COLORS.textGray} />
                      <Text style={[styles.paymentText, paymentMethod === 1 && styles.paymentTextActive]}>Tiền mặt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.paymentOption, paymentMethod === 2 && styles.paymentOptionActive]}
                      onPress={() => setPaymentMethod(2)}
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
                    placeholder="Ghi chú hóa đơn..."
                    placeholderTextColor={COLORS.textGray}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomDock, { paddingBottom: Platform.OS === "ios" ? 40 : 24 }]}>
        <View style={styles.dockTotal}>
          <Text style={styles.dockLabel}>Tổng thanh toán</Text>
          <Text style={styles.dockValue}>{formatMoney(finalAmount)}</Text>
        </View>
        <TouchableOpacity style={styles.dockBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.dockBtnText}>Thanh toán</Text>}
        </TouchableOpacity>
      </View>

      {/* Confirm delete item (giống web modal confirmDelete) */}
      {deleteData && (
        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setDeleteData(null)}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: "auto", width: "90%", borderRadius: 16, backgroundColor: "#fff" }]}>
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", textAlign: "center", marginBottom: 12 }}>
                  Xóa {deleteData.type === "product" ? "sản phẩm" : "dịch vụ"}?
                </Text>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity style={[styles.btnCancel, { flex: 1 }]} onPress={() => setDeleteData(null)}>
                    <Text style={{ fontWeight: "600", color: COLORS.text }}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.dockBtn, { flex: 1, backgroundColor: COLORS.primary }]} onPress={confirmDelete}>
                    <Text style={styles.dockBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

/** =========================
 * Wrapper ModalInvoice (giống web export default)
 * ========================= */
export default function ModalInvoice({ type, shown, item, onClose, onSubmit, onDelete }: Props) {
  if (!type) return null;

  return (
    <Modal animationType="slide" transparent visible={shown} onRequestClose={onClose}>
      <Fragment>
        {(type === "add" || type === "edit") && <FormModal mode={type} shown={shown} item={item} onClose={onClose} onSubmit={onSubmit} />}

        {type === "delete" && <DeleteModal shown={shown} onClose={onClose} onDelete={onDelete} />}

        {/* mobile bạn hiện không dùng detail; nếu sau này cần, có thể thêm DetailModal ở đây */}
      </Fragment>
    </Modal>
  );
}
