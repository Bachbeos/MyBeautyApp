import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Input, Button, CheckBox, Icon } from '@rneui/themed';
import { registerStyles as styles } from './registerScreen.styles';
import { RootStackParamList } from '../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from 'expo-toast';

import LogoApp from '../../../assets/splash/logoApp.svg';
import LogoGoogle from '../../../assets/images/logo_google.svg';
import { Divider } from 'react-native-elements';
import { IUserRegisterRequest } from '../../model/user/UserRequestModel';
import UserService from '../../services/UserService';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(true);
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const body: IUserRegisterRequest = {
    phone: phone,
    plainPassword: password,
    name: name,
  };

  const handleRegisterSuccess = () => {
    toast.show('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
    navigation.navigate('Login');
  };

  const handleSubmit = async () => {
    if (!name || !phone || !password || !confirmPassword) {
      toast.show('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      toast.show('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }
    if (!agree) {
      toast.show('Vui lòng đồng ý với Điều khoản & Quyền riêng tư để tiếp tục.');
      return;
    }
    setIsLoading(true);
    const response = await UserService.register(body);
    if (response?.result.success) {
      handleRegisterSuccess();
    }
    setIsLoading(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <LogoApp width={140} height={24} style={styles.logo} />

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Tạo mới tài khoản CMRS</Text>
        </View>

        {/* Name */}
        <Input
          placeholder="Họ tên"
          rightIcon={{ type: 'font-awesome', name: 'user', color: '#888' }}
          value={name}
          onChangeText={setName}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Phone */}
        <Input
          placeholder="Số điện thoại"
          rightIcon={{ type: 'font-awesome', name: 'phone', color: '#888' }}
          value={phone}
          onChangeText={setPhone}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Password */}
        <Input
          placeholder="Mật khẩu"
          secureTextEntry={!showPassword}
          rightIcon={{
            type: 'font-awesome',
            name: showPassword ? 'eye' : 'eye-slash',
            color: '#888',
            onPress: () => setShowPassword(!showPassword),
          }}
          value={password}
          onChangeText={setPassword}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Confirm Password */}
        <Input
          placeholder="Nhập lại mật khẩu"
          secureTextEntry={!showConfirmPassword}
          rightIcon={{
            type: 'font-awesome',
            name: showConfirmPassword ? 'eye' : 'eye-slash',
            color: '#888',
            onPress: () => setShowConfirmPassword(!showConfirmPassword),
          }}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Terms and Privacy */}
        <CheckBox
          title={
            <Text style={styles.checkboxLabel}>
              Tôi đồng ý với <Text style={styles.linkPrimary}>Điều khoản & Quyền riêng tư</Text>
            </Text>
          }
          checked={agree}
          onPress={() => setAgree(!agree)}
          containerStyle={styles.checkbox}
        />

        {/* Sign Up Button */}
        <Button
          title="Đăng ký"
          buttonStyle={styles.primaryBtn}
          containerStyle={{ width: '100%', marginVertical: 10 }}
          loading={isLoading}
          disabled={isLoading}
          onPress={handleSubmit}
        />

        {/* Already have account */}
        <Text style={styles.signInText}>
          Bạn đã có tài khoản?{' '}
          <Text style={styles.linkPrimary} onPress={() => navigation.navigate('Login')}>
            Đăng nhập ngay
          </Text>
        </Text>

        {/* OR separator */}
        <View style={styles.orContainer}>
          <Divider style={styles.line} />
          <Text style={styles.orText}>HOẶC</Text>
          <Divider style={styles.line} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <Button
            icon={<Icon name="facebook" type="font-awesome" color="white" />}
            buttonStyle={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
          />
          <Button
            icon={<LogoGoogle width={34} height={34} />}
            buttonStyle={[
              styles.socialBtn,
              { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E8E8' },
            ]}
          />
          <Button
            icon={<Icon name="apple" type="font-awesome" color="white" />}
            buttonStyle={[styles.socialBtn, { backgroundColor: '#000' }]}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <Text style={styles.footer}>© {new Date().getFullYear()} - CRMS</Text>
    </View>
  );
};

export default RegisterScreen;
