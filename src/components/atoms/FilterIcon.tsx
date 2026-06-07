import React from 'react';
import { View } from 'react-native';
import { styles } from './styles/FilterIcon';

export default function FilterIcon({ color = '#fff' }: { color?: string }) {
  return (
    <View style={styles.icon}>
      <View style={[styles.bar, { width: 16, backgroundColor: color }]} />
      <View style={[styles.bar, { width: 11, backgroundColor: color }]} />
      <View style={[styles.bar, { width: 6, backgroundColor: color }]} />
    </View>
  );
}

