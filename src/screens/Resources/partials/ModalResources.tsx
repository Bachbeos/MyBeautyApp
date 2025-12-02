import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IResourceItem } from '../../../model/resource/ResourceRespondModel';
import { IResourceUpdateRequest } from '../../../model/resource/ResourceRequestModel';

interface ModalProps {
  visible: boolean;
  type: 'add' | 'edit' | 'delete' | 'detail' | null;
  item?: IResourceItem | null;
  onClose: () => void;
  onSubmit: (data: IResourceUpdateRequest) => Promise<void>;
  onDelete: () => Promise<void>;
}

const COLORS = {
  primary: '#e41f07',
  white: '#ffffff',
  text: '#1f2020',
  textGray: '#707070',
  border: '#e8e8e8',
  danger: '#ef1e1e',
  bgBackdrop: 'rgba(0,0,0,0.5)',
  inputBg: '#f7f8f9',
  bgBlueLight: 'rgba(47, 128, 237, 0.1)',
  blue: '#2f80ed',
};

const ACTION_OPTIONS = ['VIEW', 'ADD', 'UPDATE', 'DELETE'];

const ModalResource: React.FC<ModalProps> = ({ visible, type, item, onClose, onSubmit, onDelete }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [uri, setUri] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (visible) {
      if ((type === 'edit' || type === 'detail') && item) {
        setName(item.name || '');
        setCode(item.code || '');
        setUri(item.uri || '');
        setDescription(item.description || '');

        // Parse Actions từ JSON String
        try {
          const parsed = JSON.parse(item.actions || '[]');
          setActions(Array.isArray(parsed) ? parsed : []);
        } catch {
          setActions([]);
        }
      } else {
        // Add mode
        setName('');
        setCode('');
        setUri('');
        setDescription('');
        setActions([]);
      }
    }
  }, [visible, type, item]);

  const toggleAction = (action: string) => {
    if (type === 'detail') return;
    setActions((prev) => {
      if (prev.includes(action)) return prev.filter((a) => a !== action);
      return [...prev, action];
    });
  };

  const handleSubmit = async () => {
    if (type === 'delete') {
      setLoading(true);
      await onDelete();
      setLoading(false);
      return;
    }

    // Validation cơ bản
    if (!name.trim() || !code.trim() || !uri.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tên, Mã và Đường dẫn tài nguyên.');
      return;
    }

    const payload: IResourceUpdateRequest = {
      name,
      code,
      uri,
      description,
      actions: JSON.stringify(actions),
      ...(type === 'edit' && item ? { id: item.id } : {}),
    };

    setLoading(true);
    await onSubmit(payload);
    setLoading(false);
  };

  const isDeleteMode = type === 'delete';
  const isDetailMode = type === 'detail';

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalView}>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {type === 'add' ? 'Thêm tài nguyên' : type === 'edit' ? 'Cập nhật tài nguyên' : type === 'detail' ? 'Chi tiết' : 'Xóa tài nguyên'}
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                    <Ionicons name="close" size={24} color={COLORS.textGray} />
                  </TouchableOpacity>
                </View>

                {/* Body */}
                <View style={styles.modalBody}>
                  {isDeleteMode ? (
                    <View style={styles.deleteContainer}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="trash-outline" size={32} color={COLORS.danger} />
                      </View>
                      <Text style={styles.confirmText}>
                        Bạn có chắc chắn muốn xóa tài nguyên <Text style={{ fontWeight: 'bold' }}>{item?.name}</Text>?
                      </Text>
                      <Text style={styles.subText}>Hành động này không thể hoàn tác.</Text>
                    </View>
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>
                          Tên tài nguyên <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                          style={[styles.input, isDetailMode && styles.inputDisabled]}
                          placeholder="Nhập tên..."
                          value={name}
                          onChangeText={setName}
                          editable={!isDetailMode}
                        />
                      </View>

                      <View style={styles.rowGroup}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                          <Text style={styles.label}>
                            Mã (Code) <Text style={styles.required}>*</Text>
                          </Text>
                          <TextInput
                            style={[styles.input, isDetailMode && styles.inputDisabled]}
                            placeholder="Nhập mã..."
                            value={code}
                            onChangeText={setCode}
                            editable={!isDetailMode}
                          />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                          <Text style={styles.label}>
                            Đường dẫn (URI) <Text style={styles.required}>*</Text>
                          </Text>
                          <TextInput
                            style={[styles.input, isDetailMode && styles.inputDisabled]}
                            placeholder="/api/..."
                            value={uri}
                            onChangeText={setUri}
                            editable={!isDetailMode}
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Hành động cho phép</Text>
                        <View style={styles.chipContainer}>
                          {ACTION_OPTIONS.map((opt) => {
                            const isSelected = actions.includes(opt);
                            return (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.chip, isSelected && styles.chipSelected, isDetailMode && !isSelected && { opacity: 0.5 }]}
                                onPress={() => toggleAction(opt)}
                                disabled={isDetailMode}
                              >
                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt}</Text>
                                {isSelected && <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput
                          style={[styles.input, styles.textArea, isDetailMode && styles.inputDisabled]}
                          placeholder="Nhập mô tả..."
                          value={description}
                          onChangeText={setDescription}
                          editable={!isDetailMode}
                          multiline={true}
                          numberOfLines={3}
                        />
                      </View>
                    </ScrollView>
                  )}
                </View>

                {/* Footer */}
                <View style={styles.modalFooter}>
                  {!isDetailMode ? (
                    <>
                      <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={onClose}>
                        <Text style={[styles.textStyle, { color: COLORS.text }]}>Hủy</Text>
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
                    </>
                  ) : (
                    <TouchableOpacity style={[styles.button, styles.buttonSave, { width: '100%' }]} onPress={onClose}>
                      <Text style={styles.textStyle}>Đóng</Text>
                    </TouchableOpacity>
                  )}
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
  keyboardView: { width: '100%', alignItems: 'center' },
  modalView: {
    width: '90%',
    maxHeight: '80%',
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
  modalTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  closeIcon: { padding: 4 },
  modalBody: { padding: 20 },

  // Form Styles
  formGroup: { marginBottom: 16 },
  rowGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6, color: COLORS.text },
  required: { color: COLORS.danger },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputDisabled: { backgroundColor: '#eeeeee', color: '#999' },

  // Chip Styles
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(228, 31, 7, 0.05)',
  },
  chipText: { fontSize: 12, color: COLORS.textGray, fontWeight: '500' },
  chipTextSelected: { color: COLORS.primary, fontWeight: '700' },

  // Delete Styles
  deleteContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 30, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmText: { fontSize: 16, textAlign: 'center', marginBottom: 8, color: COLORS.text },
  subText: { fontSize: 14, color: COLORS.textGray, textAlign: 'center' },

  // Footer
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
  buttonClose: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border },
  buttonSave: { backgroundColor: COLORS.primary },
  buttonDelete: { backgroundColor: COLORS.danger },
  textStyle: { color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 14 },
});

export default ModalResource;
