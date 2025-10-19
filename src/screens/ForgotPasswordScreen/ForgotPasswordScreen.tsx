import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Input, Button, CheckBox, Icon } from '@rneui/themed';
import { forgotPasswordStyles as styles } from './ForgotPasswordScreen.styles';
import { RootStackParamList } from '../../types/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { Divider } from 'react-native-elements';
import LogoApp from '../../../assets/splash/logoApp.svg';
import LogoGoogle from '../../../assets/images/logo_google.svg';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <LogoApp width={140} height={24} style={styles.logo} />

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nếu bạn quên mật khẩu, chúng tôi sẽ gửi email hướng dẫn bạn đặt lại mật khẩu.
          </Text>
        </View>

        {/* Email */}
        <Input
          placeholder="Email"
          keyboardType="email-address"
          rightIcon={{ type: 'font-awesome', name: 'envelope', color: '#888' }}
          value={email}
          onChangeText={setEmail}
          inputStyle={styles.inputText}
          containerStyle={styles.inputContainer}
        />

        {/* Submit Button */}
        <Button
          title="Gửi"
          buttonStyle={styles.primaryBtn}
          containerStyle={styles.buttonContainer}
          onPress={() => console.log('Submit pressed')}
        />

        {/* Return to Login */}
        <Text style={styles.returnText}>
          Quay lại màn hình{' '}
          <Text style={styles.linkPrimary} onPress={() => navigation.navigate('Register')}>
            Đăng nhập
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

export default ForgotPasswordScreen;
