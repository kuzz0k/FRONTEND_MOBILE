import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CenterOnUserButtonProps {
  onPress: () => void;
  isLocationAvailable: boolean;
}

export default function CenterOnUserButton({ 
  onPress, 
  isLocationAvailable 
}: CenterOnUserButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { opacity: isLocationAvailable ? 1 : 0.5 }
      ]}
      onPress={onPress}
      disabled={!isLocationAvailable}
    >
      <Icon 
        name="my-location" 
        size={24} 
        color={isLocationAvailable ? "#007AFF" : "#999"} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
