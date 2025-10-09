import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import LogoApp from '../../../assets/splash/logoApp.svg';

type SplashScreenProps = {
  navigation: any;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500); // 2.5 giây

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../../../assets/splash/logoApp.png')}
        style={styles.logo}
        resizeMode="contain"
      /> */}
      <LogoApp width={200} height={200} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
