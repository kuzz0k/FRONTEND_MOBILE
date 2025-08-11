import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ConfirmLocationMarkerProps {
  size?: number;
}

export default function ConfirmLocationMarker({ size = 20 }: ConfirmLocationMarkerProps) {
  return (
    <View style={styles.container} collapsable={false}>
      <View style={[styles.marker, { width: size, height: size }]} />
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  alignItems: 'center',
  overflow: 'visible',
},

  marker: {
    backgroundColor: '#FF6B6B',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
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
