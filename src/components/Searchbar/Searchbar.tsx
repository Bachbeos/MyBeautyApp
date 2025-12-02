import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { text: '#1f2020', textGray: '#9ca3af', bg: '#f7f8f9', border: '#e8e8e8' };

type Props = {
  placeholder?: string;
  onSearch?: (q: string) => void;
  value?: string;
};

export default function SearchBar({ placeholder = 'Tìm kiếm...', onSearch, value }: Props) {
  const [q, setQ] = useState(value || '');

  useEffect(() => {
    const t = setTimeout(() => {
      onSearch?.(q);
    }, 500);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (value !== undefined && value !== q) {
      setQ(value);
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={COLORS.textGray} style={styles.icon} />
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={COLORS.textGray} value={q} onChangeText={setQ} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 42,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    height: '100%',
    paddingVertical: 0,
  },
});
