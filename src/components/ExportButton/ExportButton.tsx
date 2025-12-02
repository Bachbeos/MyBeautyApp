import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = { text: '#707070', bg: '#ffffff', border: '#e8e8e8', textDark: '#1f2020' };

type Props = {
  onExport?: (format: 'pdf' | 'xls') => void;
};

export default function ExportButton({ onExport }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (format: 'pdf' | 'xls') => {
    setModalVisible(false);
    onExport?.(format);
  };

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
        <MaterialCommunityIcons name="export-variant" size={20} color={COLORS.text} />
        <Text style={styles.btnText}>Export</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.item} onPress={() => handleSelect('pdf')}>
                <MaterialCommunityIcons name="file-pdf-box" size={20} color="#dc2626" />
                <Text style={styles.itemText}>Export file PDF</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.item} onPress={() => handleSelect('xls')}>
                <MaterialCommunityIcons name="file-excel-box" size={20} color="#16a34a" />
                <Text style={styles.itemText}>Export file Excel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  btnText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  itemText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});
