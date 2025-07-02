import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface UserLocationMarkerProps {
  size?: number;
  isActive?: boolean;
}

export default function UserLocationMarker({ 
  size = 20, 
  isActive = true 
}: UserLocationMarkerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [isActive, pulseAnim]);

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      <Animated.View style={[
        styles.outerCircle, 
        { 
          width: size * 2, 
          height: size * 2,
          backgroundColor: isActive ? 'rgba(0, 122, 255, 0.3)' : 'rgba(128, 128, 128, 0.3)',
          transform: [{ scale: pulseAnim }]
        }
      ]}>
        <View style={[
          styles.innerCircle,
          {
            width: size,
            height: size,
            backgroundColor: isActive ? '#007AFF' : '#808080'
          }
        ]}>
          <Icon 
            name="person" 
            size={size * 0.6} 
            color="white" 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  innerCircle: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
