import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IRoleItem } from '../../../model/role/RoleResponseModel';
import { IRoleUpdateRequest } from '../../../model/role/RoleRequestModel';

interface RoleModalProps {
  visible: boolean;
  type: 'add' | 'edit' | 'delete' | null;
  item?: IRoleItem | null;
  onClose: () => void;
  onSubmit: (data: IRoleUpdateRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const COLORS = {
  primary: '#e41f07',
  secondary: '#ffa201',
  white: '#ffffff',
  text: '#1f2020',
  textGray: '#707070',
  border: '#e8e8e8',
  danger: '#ef1e1e',
  bgBackdrop: 'rgba(0,0,0,0.5)',
  inputBg: '#f7f8f9',
};

const RoleModal: React.FC<RoleModalProps> = ({ visible, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (type === 'edit' && item) {
        setName(item.name);
        setIsDefault(item.isDefault === 1);
        setIsOperator(item.isOperator === 1);
      } else {
        // Reset for Add mode
        setName('');
        setIsDefault(false);
        setIsOperator(false);
      }
    }
  }, [visible, type, item]);

  const handleSubmit = async () => {
    if (type === 'delete') {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      // Có thể dùng Toast thay vì Alert nếu muốn
      alert('Vui lòng nhập tên vai trò');
      return;
    }

    const payload: IRoleUpdateRequest = {
      name,
      isDefault: isDefault ? 1 : 0,
      isOperator: isOperator ? 1 : 0,
      ...(type === 'edit' && item ? { id: item.id } : {}),
    };

    setLoading(true);
    await onSubmit(payload);
    setLoading(false);
  };

  const isDeleteMode = type === 'delete';

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalView}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{type === 'add' ? 'Thêm vai trò mới' : type === 'edit' ? 'Cập nhật vai trò' : 'Xóa vai trò'}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                    <Ionicons name="close" size={24} color={COLORS.textGray} />
                  </TouchableOpacity>
                </View>

                {/* Body */}
                <View style={styles.modalBody}>
                  {isDeleteMode ? (
                    <View style={styles.deleteContainer}>
                      <Ionicons name="warning-outline" size={48} color={COLORS.danger} />
                      <Text style={styles.confirmText}>
                        Bạn có chắc chắn muốn xóa vai trò <Text style={{ fontWeight: 'bold' }}>{item?.name}</Text>?
                      </Text>
                      <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>
                          Tên vai trò <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Nhập tên vai trò..."
                          value={name}
                          onChangeText={setName}
                          placeholderTextColor="#999"
                        />
                      </View>

                      <View style={styles.switchContainer}>
                        <Text style={styles.label}>Quyền mặc định</Text>
                        <Switch
                          value={isDefault}
                          onValueChange={setIsDefault}
                          trackColor={{ false: '#767577', true: COLORS.primary }}
                          thumbColor={COLORS.white}
                        />
                      </View>

                      <View style={styles.switchContainer}>
                        <Text style={styles.label}>Quyền điều hành</Text>
                        <Switch
                          value={isOperator}
                          onValueChange={setIsOperator}
                          trackColor={{ false: '#767577', true: COLORS.primary }}
                          thumbColor={COLORS.white}
                        />
                      </View>
                    </>
                  )}
                </View>

                {/* Footer */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                    <Text style={[styles.textStyle, { color: COLORS.text }]}>Hủy bỏ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, isDeleteMode ? styles.buttonDelete : styles.buttonSave]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.textStyle}>{isDeleteMode ? 'Xóa' : 'Lưu lại'}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgBackdrop,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeIcon: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  // Form Styles
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.text,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  // Delete Styles
  deleteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  confirmText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.text,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  // Footer Styles
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  button: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 0,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonClose: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonSave: {
    backgroundColor: COLORS.primary,
  },
  buttonDelete: {
    backgroundColor: COLORS.danger,
  },
  textStyle: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default RoleModal;
