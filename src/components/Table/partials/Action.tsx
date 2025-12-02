import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TableActionProps } from '../Table.types';

const COLORS = {
  primary: '#e41f07',
  secondary: '#ffa201',
  success: '#1abe17',
  info: '#2f80ed',
  warning: '#f9b801',
  danger: '#ef1e1e',
  // Soft backgrounds (opacity ~0.1)
  softInfo: 'rgba(47, 128, 237, 0.1)',
  softDanger: 'rgba(239, 30, 30, 0.1)',
  softWarning: 'rgba(249, 184, 1, 0.1)',
  softEdit: 'rgba(112, 112, 112, 0.1)', // Gray soft
};

export default function ActionsTable<T extends Record<string, unknown>>({ row, onEdit, onDelete, onView, onPermission, extra }: TableActionProps<T>) {
  return (
    <View style={styles.container}>
      {onView && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.softInfo }]} onPress={() => onView(row)}>
          <MaterialCommunityIcons name="eye-outline" size={20} color={COLORS.info} />
        </TouchableOpacity>
      )}

      {onEdit && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.softEdit }]} onPress={() => onEdit(row)}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#707070" />
        </TouchableOpacity>
      )}

      {onPermission && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.softWarning }]} onPress={() => onPermission(row)}>
          <MaterialCommunityIcons name="shield-account-outline" size={20} color={COLORS.warning} />
        </TouchableOpacity>
      )}

      {onDelete && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.softDanger }]} onPress={() => onDelete(row)}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      )}

      {extra && extra(row)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 8, // Rounded corners like web
    alignItems: 'center',
    justifyContent: 'center',
  },
});
