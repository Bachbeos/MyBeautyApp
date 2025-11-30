import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Input, Button, CheckBox, Icon } from '@rneui/themed';
import { loginStyles as styles } from './loginScreen.styles';
import { RootStackParamList } from '../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Divider } from 'react-native-elements';
import LogoApp from '../../../assets/splash/logoApp.svg';
import LogoGoogle from '../../../assets/images/logo_google.svg';
import { IUserLoginRequest } from '../../model/user/UserRequestModel';
import UserService from '../../services/UserService';
import { useToast } from 'expo-toast';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const abortController = useRef<AbortController | null>(null);

  const body: IUserLoginRequest = {
    phone,
    plainPassword: password,
  };

  const handleLoginSuccess = async (token: string) => {
    try {
      await SecureStore.setItemAsync('token', token);
    } catch (e) {}
    toast.show('Đăng nhập thành công!');
    navigation.replace('Home');
  };

  const handleSubmit = async () => {
    if (!phone || !password) {
      return toast.show('Vui lòng nhập đầy đủ thông tin!');
    }

    setIsLoading(true);

    try {
      const respond = await UserService.login(body);

      if (respond?.result?.token) {
        await handleLoginSuccess(respond.result.token);
      } else if (respond?.code === 400) {
        toast.show(respond?.message || 'Số điện thoại hoặc mật khẩu không đúng!');
      } else {
        toast.show(respond?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.show('Không thể kết nối tới máy chủ. Vui lòng thử lại sau!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => abortController.current?.abort();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <LogoApp width={140} height={24} style={styles.logo} />

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Truy cập hệ thống CRMS bằng số điện thoại và mật khẩu của bạn.</Text>
        </View>

        {/* Số điện thoại */}
        <Input
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
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

        {/* Remember me + Forgot */}
        <View style={styles.row}>
          <CheckBox
            title="Ghi nhớ đăng nhập"
            checked={remember}
            onPress={() => setRemember(!remember)}
            containerStyle={styles.checkbox}
            textStyle={styles.checkboxLabel}
          />
          <TouchableOpacity>
            <Text style={styles.linkDanger} onPress={() => navigation.navigate('ForgotPassword')}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <Button
          title="Đăng nhập"
          buttonStyle={styles.primaryBtn}
          containerStyle={styles.buttonContainer}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />

        {/* Create account */}
        <Text style={styles.signupText}>
          Mới sử dụng hệ thống của chúng tôi?{' '}
          <Text style={styles.linkPrimary} onPress={() => navigation.navigate('Register')}>
            Tạo tài khoản
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
            buttonStyle={[styles.socialBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8E8E8' }]}
          />
          <Button icon={<Icon name="apple" type="font-awesome" color="white" />} buttonStyle={[styles.socialBtn, { backgroundColor: '#000' }]} />
        </View>
      </ScrollView>

      {/* Footer */}
      <Text style={styles.footer}>© {new Date().getFullYear()} - CRMS</Text>
    </View>
  );
};

export default LoginScreen;
