import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles/PageIndicator';

interface Props {
  current: number;
  total: number;
}

export default function PageIndicator({ current, total }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{current} / {total}</Text>
    </View>
  );
}

