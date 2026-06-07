import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CoverImage from '../atoms/CoverImage';
import type { BookmarkedManga } from '../../storage';
import { styles } from './styles/BookmarkCard';

interface Props {
  item: BookmarkedManga;
  onPress: () => void;
  onRemove: () => void;
}

export default function BookmarkCard({ item, onPress, onRemove }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <CoverImage uri={item.coverUrl} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

