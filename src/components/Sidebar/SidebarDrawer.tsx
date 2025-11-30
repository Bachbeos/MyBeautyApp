import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Dimensions, TouchableWithoutFeedback, View, Platform, StatusBar } from 'react-native';
import Sidebar from './Sidebar';
import { SIDEBAR_WIDTH } from './Sidebar.styles';
import { useSidebar } from './SidebarContext';

const WINDOW = Dimensions.get('window');

export default function SidebarDrawer() {
  const { isOpen, close } = useSidebar();
  const [visible, setVisible] = useState(isOpen);
  const anim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    console.log('[SidebarDrawer] isOpen ->', isOpen);
    if (isOpen) {
      setVisible(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    }
  }, [isOpen, anim]);

  useEffect(() => {
    // debug: log animation value periodically if needed
    const id = anim.addListener(({ value }) => {
      // uncomment to log continuous value (can be noisy)
      // console.log("[SidebarDrawer] anim value", value);
    });
    return () => anim.removeListener(id);
  }, [anim]);

  if (!visible) return null;

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const overlayOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Adjust for Android StatusBar translucent behaviour if needed
  const topOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingTop: topOffset }]}>
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View pointerEvents="auto" style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
            height: WINDOW.height,
          },
        ]}
      >
        <Sidebar />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: WINDOW.width,
    height: WINDOW.height,
    zIndex: 99999,
    elevation: 99999,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#000',
    // overlay must be absolute to catch touches and to allow sidebar to not stretch overlay
    position: 'absolute',
    left: 0,
    top: 0,
    width: WINDOW.width,
    height: WINDOW.height,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 0 },
    elevation: 24,
    zIndex: 100000,
  },
});
