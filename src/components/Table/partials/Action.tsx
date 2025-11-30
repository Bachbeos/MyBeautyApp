import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TableActionProps } from '../Table.types';

export default function ActionsTable<T extends Record<string, unknown>>({ row, onEdit, onDelete, onView, onPermission, extra }: TableActionProps<T>) {
  return (
    <View style={styles.container}>
      {onView && (
        <TouchableOpacity style={[styles.btn, styles.btnInfo]} onPress={() => onView(row)}>
          <MaterialCommunityIcons name="eye-outline" size={18} color="#2f80ed" />
        </TouchableOpacity>
      )}

      {onEdit && (
        <TouchableOpacity style={[styles.btn, styles.btnLight]} onPress={() => onEdit(row)}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#4b5563" />
        </TouchableOpacity>
      )}

      {onPermission && (
        <TouchableOpacity style={[styles.btn, styles.btnWarning]} onPress={() => onPermission(row)}>
          <MaterialCommunityIcons name="shield-account-outline" size={18} color="#f9b801" />
        </TouchableOpacity>
      )}

      {onDelete && (
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => onDelete(row)}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef1e1e" />
        </TouchableOpacity>
      )}

      {extra && extra(row)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLight: { backgroundColor: '#f3f4f6' },
  btnInfo: { backgroundColor: '#e0f2fe' },
  btnDanger: { backgroundColor: '#fee2e2' },
  btnWarning: { backgroundColor: '#fef3c7' },
});
