import React, { useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, Switch, ScrollView, Pressable, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "../Permission.styles";
import { IResourcePermissionItem } from "../../../model/permissions/PermissionResponseModel";

interface ModalPermissionProps {
  visible: boolean;
  item: IResourcePermissionItem | null;
  canEdit: boolean;
  onClose: () => void;
  onToggle: (action: string, value: boolean) => void;
  onToggleAll: (value: boolean) => void;
}

const ModalPermission: React.FC<ModalPermissionProps> = ({ visible, item, canEdit, onClose, onToggle, onToggleAll }) => {
  const availableActions = useMemo(() => {
    if (!item?.actions) return [];
    try {
      const parsed = JSON.parse(item.actions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [item]);

  const grantedActions = useMemo(() => {
    if (!item?.permission?.actions) return [];
    try {
      const parsed = JSON.parse(item.permission.actions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [item]);

  const isAllSelected = availableActions.length > 0 && availableActions.every((action) => grantedActions.includes(action));

  if (!item) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView} pointerEvents="box-none">
          <Pressable style={[styles.modalView, { width: "95%", maxHeight: "92%" }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                <Text style={[styles.modalTitle, { flex: 0 }]} numberOfLines={1}>
                  Cấu hình quyền
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.textGray }} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color={COLORS.textGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {availableActions.length === 0 ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Ionicons name="alert-circle-outline" size={40} color={COLORS.textGray} />
                  <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.textGray,
                      marginTop: 10,
                    }}
                  >
                    Tài nguyên này không có hành động nào để cấu hình.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={[styles.permissionItem, styles.allOption]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons
                        name={isAllSelected ? "checkbox" : "square-outline"}
                        size={24}
                        color={isAllSelected ? COLORS.primary : COLORS.textGray}
                      />
                      <Text style={[styles.permissionLabel, { fontWeight: "bold", marginLeft: 8 }]}>Chọn tất cả</Text>
                    </View>
                    <Switch
                      trackColor={{ false: "#767577", true: COLORS.primary }}
                      thumbColor={COLORS.white}
                      value={isAllSelected}
                      onValueChange={canEdit ? onToggleAll : undefined}
                      disabled={!canEdit}
                    />
                  </View>

                  {availableActions.map((action: string) => {
                    const isChecked = grantedActions.includes(action);
                    return (
                      <View key={action} style={styles.permissionItem}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons
                            name={isChecked ? "checkmark-circle" : "ellipse-outline"}
                            size={20}
                            color={isChecked ? COLORS.success : COLORS.textGray}
                          />
                          <Text style={[styles.permissionLabel, { marginLeft: 8 }]}>{action}</Text>
                        </View>
                        <Switch
                          trackColor={{ false: "#767577", true: COLORS.primary }}
                          thumbColor={COLORS.white}
                          value={isChecked}
                          onValueChange={canEdit ? (val) => onToggle(action, val) : undefined}
                          disabled={!canEdit}
                        />
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                <Text style={[styles.textStyle, { color: COLORS.text }]}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ModalPermission;
