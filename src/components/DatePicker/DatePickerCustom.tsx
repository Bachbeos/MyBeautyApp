import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  border: "#e8e8e8",
  inputBg: "#fff",
  text: "#1f2020",
  textGray: "#707070",
  danger: "#ef1e1e",
  inputDisabled: "#f3f4f6",
};

interface DatePickerProps {
  label: string;
  value?: string | Date;
  onConfirm: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const DatePickerCustom: React.FC<DatePickerProps> = ({
  label,
  value,
  onConfirm,
  mode = "datetime",
  required = false,
  disabled = false,
  placeholder = "Chọn thời gian",
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const horizontalMargin = 90;
  const maxPickerWidth = 520;
  const pickerWidth = Math.min(windowWidth - horizontalMargin, maxPickerWidth);

  const showDatePicker = () => {
    if (!disabled) setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    onConfirm(date);
    hideDatePicker();
  };

  const getDisplayValue = () => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value.toString();

    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);

    if (mode === "date") return `${day}/${month}/${year}`;
    if (mode === "time") return `${hours}:${minutes}`;
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={{ color: COLORS.danger }}>*</Text>}
      </Text>

      <TouchableOpacity onPress={showDatePicker} style={[styles.inputContainer, disabled && styles.disabled]} activeOpacity={0.7}>
        <Text style={[styles.text, !value && styles.placeholderText]} numberOfLines={1}>
          {getDisplayValue() || placeholder}
        </Text>

        <Ionicons name="calendar-outline" size={20} color={COLORS.textGray} />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={mode}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={value ? new Date(value) : new Date()}
        locale="vi-VN"
        confirmTextIOS="Xác nhận"
        cancelTextIOS="Hủy"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        pickerContainerStyleIOS={{
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 0,
          paddingVertical: 0,
        }}
        pickerStyleIOS={{
          width: pickerWidth,
          alignSelf: "center",
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: COLORS.text,
  },
  inputContainer: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabled: {
    backgroundColor: COLORS.inputDisabled,
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: COLORS.textGray,
  },
});

export default DatePickerCustom;
