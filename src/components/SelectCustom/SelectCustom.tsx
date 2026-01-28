import React, { useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Option {
  id: number | string;
  name: string;
  [key: string]: any;
}

interface SelectCustomProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: number | string;
  onChange: (item: Option) => void;
  disabled?: boolean;
  title?: string;
  required?: boolean;
}

const COLORS = {
  primary: "#e41f07",
  text: "#1f2020",
  textGray: "#707070",
  border: "#e8e8e8",
  inputBg: "#fff",
  white: "#fff",
  bgBackdrop: "rgba(0,0,0,0.5)",
};

const ITEM_HEIGHT = 50;

export default function SelectCustom({ label, placeholder, options, value, onChange, disabled, title, required }: SelectCustomProps) {
  const [visible, setVisible] = useState(false);
  const [keyword, setKeyword] = useState("");

  const selectedItem = useMemo(() => options.find((opt) => opt.id == value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!keyword) return options;
    const lowerKeyword = keyword.toLowerCase();
    return options.filter((opt) => opt.name.toLowerCase().includes(lowerKeyword));
  }, [options, keyword]);

  const handleSelect = (item: Option) => {
    onChange(item);
    setVisible(false);
    setKeyword("");
  };

  const renderItem = useCallback(
    ({ item }: { item: Option }) => {
      const isSelected = item.id == value;
      return (
        <TouchableOpacity style={[styles.optionItem, isSelected && styles.selectedOption]} onPress={() => handleSelect(item)}>
          <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{item.name}</Text>
          {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
        </TouchableOpacity>
      );
    },
    [value]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: "#ef1e1e" }}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.inputButton, disabled && styles.disabledButton]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.inputText, !selectedItem && styles.placeholderText]}>{selectedItem ? selectedItem.name : placeholder || "Chọn..."}</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textGray} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title || "Lựa chọn"}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textGray} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                placeholderTextColor={COLORS.textGray}
                value={keyword}
                onChangeText={setKeyword}
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              getItemLayout={getItemLayout}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: COLORS.textGray }}>Không tìm thấy dữ liệu</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6, color: COLORS.text },
  inputButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledButton: { backgroundColor: "#e9ecef" },
  inputText: { fontSize: 14, color: COLORS.text },
  placeholderText: { color: COLORS.textGray },

  modalOverlay: { flex: 1, backgroundColor: COLORS.bgBackdrop, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, height: "100%", fontSize: 15, color: COLORS.text },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    height: ITEM_HEIGHT,
  },
  selectedOption: { backgroundColor: "#fff5f5" },
  optionText: { fontSize: 15, color: COLORS.text },
  selectedOptionText: { color: COLORS.primary, fontWeight: "600" },
});
