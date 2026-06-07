import React from 'react';
import { View, Image, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { styles } from './styles/CoverImage';

interface Props {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  label?: string;
}

export default function CoverImage({ uri, style, label }: Props) {
  if (uri) {
    return <Image source={{ uri }} style={style as any} resizeMode="cover" />;
  }
  return (
    <View style={[styles.placeholder, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

