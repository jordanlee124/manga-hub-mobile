import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import FilterIcon from '../atoms/FilterIcon';
import { styles } from './styles/SearchBar';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFilterPress: () => void;
  filterCount: number;
}

export default function SearchBar({ value, onChangeText, onSubmit, onFilterPress, filterCount }: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Search manga..."
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.goButton} onPress={onSubmit}>
        <Text style={styles.goText}>Go</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <FilterIcon />
        {filterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

