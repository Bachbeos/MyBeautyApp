import React from 'react';
import { View, Image, TextInput, TouchableOpacity } from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
import { headerStyles as styles } from './Header.styles';

const Header = () => {
  return (
    <View style={styles.header}>
      {/* Logo & Menu */}
      <View style={styles.leftSection}>
        <Image
          source={require('../../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="menu" type="feather" color="#333" size={24} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" type="feather" color="#888" size={18} />
        <TextInput placeholder="Search Keyword" style={styles.searchInput} />
      </View>

      {/* Actions */}
      <View style={styles.rightSection}>
        <TouchableOpacity>
          <Icon name="bell" type="feather" color="#333" size={22} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="message-circle" type="feather" color="#333" size={22} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Avatar
            rounded
            size={34}
            source={{ uri: 'https://i.pravatar.cc/100' }}
            containerStyle={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
