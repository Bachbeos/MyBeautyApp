import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { text: '#707070', bg: '#ffffff', border: '#e8e8e8' };

type Props = {
  onRefresh?: () => void;
  style?: ViewStyle;
};

export default function RefreshButton({ onRefresh, style }: Props) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onRefresh} activeOpacity={0.7}>
      <Ionicons name="refresh" size={20} color={COLORS.text} />
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
});
