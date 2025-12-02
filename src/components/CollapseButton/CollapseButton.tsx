import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  text: '#707070',
  bg: '#ffffff',
  border: '#e8e8e8',
  primary: '#e41f07',
  primaryLight: 'rgba(228, 31, 7, 0.1)',
};

type Props = {
  onCollapse?: () => void;
  active?: boolean;
  style?: ViewStyle;
};

export default function CollapseButton({ onCollapse, active, style }: Props) {
  return (
    <TouchableOpacity style={[styles.container, active && styles.active, style]} onPress={onCollapse} activeOpacity={0.7}>
      <Ionicons name={active ? 'chevron-up' : 'chevron-down'} size={20} color={active ? COLORS.primary : COLORS.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  active: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
});
