import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header/Header';

// 1. Import hook useSidebar
import { useSidebar } from '../../components/Sidebar/SidebarContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // 2. Lấy hàm open từ context
  const { open } = useSidebar();

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 3. Truyền hàm open vào sự kiện onMenuPress */}
      <Header onMenuPress={open} />

      <View style={styles.container}>
        {/* ... nội dung cũ giữ nguyên ... */}
        <Text style={styles.title}>Welcome to MyBeautyApp</Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ... giữ nguyên phần styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ccc',
  },
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Home;
