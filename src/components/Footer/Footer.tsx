import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import styles from './Footer.styles';

export default function Footer() {
  const handlePress = (type: string) => {
    // Xử lý sự kiện khi bấm vào link (mở web hoặc navigate màn hình)
    console.log(`Pressed: ${type}`);
    // Ví dụ: Linking.openURL('https://google.com');
  };

  return (
    <View style={styles.container}>
      {/* Phần Copyright */}
      <View style={styles.copyrightRow}>
        <Text style={styles.text}>Copyright © {new Date().getFullYear()} </Text>
        <TouchableOpacity onPress={() => handlePress('CRMS')}>
          <Text style={[styles.text, styles.linkPrimary]}>CRMS</Text>
        </TouchableOpacity>
      </View>

      {/* Phần Links */}
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => handlePress('About')}>
          <Text style={styles.linkText}>About</Text>
        </TouchableOpacity>

        <View style={styles.dot} />

        <TouchableOpacity onPress={() => handlePress('Terms')}>
          <Text style={styles.linkText}>Terms</Text>
        </TouchableOpacity>

        <View style={styles.dot} />

        <TouchableOpacity onPress={() => handlePress('Contact')}>
          <Text style={styles.linkText}>Contact Us</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
