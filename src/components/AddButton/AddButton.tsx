import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { primary: '#e41f07', white: '#ffffff' };

type Props = {
  label?: string;
  onClick?: () => void;
  style?: ViewStyle;
};

export default function AddButton({ label = 'Thêm mới', onClick, style }: Props) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onClick} activeOpacity={0.8}>
      <Ionicons name="add-circle-outline" size={20} color={COLORS.white} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
