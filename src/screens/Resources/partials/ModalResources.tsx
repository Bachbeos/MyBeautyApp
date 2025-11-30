import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Định nghĩa kiểu dữ liệu cho Resource
export interface IResourceItem {
  id?: number | string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  actions?: string; // JSON string: ["add", "edit", "delete", "view"]
  created_at?: string;
}

type ModalType = 'add' | 'edit' | 'delete' | 'detail';

type Props = {
  visible: boolean;
  type: ModalType | null;
  item?: IResourceItem | null;
  onClose: () => void;
  onSubmit: (data: IResourceItem) => void;
  onDelete: (id: string | number) => void;
};

const ACTION_OPTIONS = [
  { key: 'add', label: 'Thêm' },
  { key: 'edit', label: 'Sửa' },
  { key: 'delete', label: 'Xóa' },
  { key: 'view', label: 'Xem' },
];

export default function ResourceModal({ visible, type, item, onClose, onSubmit, onDelete }: Props) {
  const [formData, setFormData] = useState<IResourceItem>({
    name: '',
    code: '',
    description: '',
    status: 'active',
    actions: '[]',
  });

  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  // Reset form khi mở modal
  useEffect(() => {
    if (visible) {
      if (item && type !== 'add') {
        setFormData(item);
        try {
          const parsedActions = item.actions ? JSON.parse(item.actions) : [];
          setSelectedActions(Array.isArray(parsedActions) ? parsedActions : []);
        } catch (e) {
          setSelectedActions([]);
        }
      } else {
        // Reset form cho Add
        setFormData({
          name: '',
          code: '',
          description: '',
          status: 'active',
          actions: '[]',
        });
        setSelectedActions([]);
      }
    }
  }, [visible, item, type]);

  const toggleAction = (key: string) => {
    if (type === 'detail') return;
    if (selectedActions.includes(key)) {
      setSelectedActions(selectedActions.filter((k) => k !== key));
    } else {
      setSelectedActions([...selectedActions, key]);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và mã tài nguyên');
      return;
    }
    const payload = {
      ...formData,
      actions: JSON.stringify(selectedActions),
    };
    onSubmit(payload);
  };

  const isReadOnly = type === 'detail';

  // Render Modal Xóa
  if (type === 'delete') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.deleteContainer}>
            <View style={styles.deleteIconBox}>
              <MaterialCommunityIcons name="trash-can-outline" size={32} color="#ef1e1e" />
            </View>
            <Text style={styles.deleteTitle}>Xóa tài nguyên</Text>
            <Text style={styles.deleteMessage}>Bạn có chắc muốn xóa tài nguyên "{item?.name}" không?</Text>

            <View style={styles.rowBtn}>
              <TouchableOpacity style={[styles.btn, styles.btnLight]} onPress={onClose}>
                <Text style={styles.btnTextGray}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => item?.id && onDelete(item.id)}>
                <Text style={styles.btnTextWhite}>Đồng ý, xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Render Modal Add/Edit/Detail
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {type === 'add' ? 'Thêm tài nguyên' : type === 'edit' ? 'Chỉnh sửa tài nguyên' : 'Chi tiết tài nguyên'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Tên */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tên tài nguyên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isReadOnly && styles.inputDisabled]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nhập tên tài nguyên"
                editable={!isReadOnly}
              />
            </View>

            {/* Mã */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Mã tài nguyên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isReadOnly && styles.inputDisabled]}
                value={formData.code}
                onChangeText={(text) => setFormData({ ...formData, code: text })}
                placeholder="Nhập mã tài nguyên"
                editable={!isReadOnly}
              />
            </View>

            {/* Mô tả */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea, isReadOnly && styles.inputDisabled]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Nhập mô tả"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isReadOnly}
              />
            </View>

            {/* Trạng thái */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trạng thái</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.radioItem, isReadOnly && { opacity: 0.6 }]}
                  onPress={() => !isReadOnly && setFormData({ ...formData, status: 'active' })}
                >
                  <MaterialCommunityIcons
                    name={formData.status === 'active' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={formData.status === 'active' ? '#e41f07' : '#9ca3af'}
                  />
                  <Text style={styles.radioLabel}>Hoạt động</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioItem, isReadOnly && { opacity: 0.6 }]}
                  onPress={() => !isReadOnly && setFormData({ ...formData, status: 'inactive' })}
                >
                  <MaterialCommunityIcons
                    name={formData.status === 'inactive' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={formData.status === 'inactive' ? '#e41f07' : '#9ca3af'}
                  />
                  <Text style={styles.radioLabel}>Không hoạt động</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions Checkbox */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hành động</Text>
              <View style={styles.actionRow}>
                {ACTION_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt.key} style={[styles.checkboxItem, isReadOnly && { opacity: 0.6 }]} onPress={() => toggleAction(opt.key)}>
                    <MaterialCommunityIcons
                      name={selectedActions.includes(opt.key) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={selectedActions.includes(opt.key) ? '#e41f07' : '#9ca3af'}
                    />
                    <Text style={styles.checkboxLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.btnLight]} onPress={onClose}>
              <Text style={styles.btnTextGray}>Đóng</Text>
            </TouchableOpacity>
            {!isReadOnly && (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
                <Text style={styles.btnTextWhite}>{type === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Delete Modal Styles
  deleteContainer: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  deleteIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Form Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef1e1e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 10,
  },
  // Button Styles
  rowBtn: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  btnLight: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: '#e41f07',
    flex: 1,
  },
  btnDanger: {
    backgroundColor: '#e41f07', // Dùng màu đỏ chủ đạo
    flex: 1,
  },
  btnTextWhite: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  btnTextGray: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
});
