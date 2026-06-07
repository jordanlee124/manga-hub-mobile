import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './styles/Chip';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function Chip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.active]} onPress={onPress}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

