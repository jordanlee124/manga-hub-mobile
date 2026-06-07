import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CoverImage from '../atoms/CoverImage';
import { getCoverFromRelationships, getCoverUrl, getTitle } from '../../api/mangadex';
import type { Manga } from '../../types/manga';
import { styles } from './styles/MangaCard';

interface Props {
  item: Manga;
  onPress: () => void;
}

export default function MangaCard({ item, onPress }: Props) {
  const cover = getCoverFromRelationships(item.relationships);
  const coverUrl = cover ? getCoverUrl(item.id, cover.attributes.fileName) : null;
  const title = getTitle(item.attributes.title, item.attributes.altTitles);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <CoverImage uri={coverUrl} style={styles.cover} label="No Cover" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.status}>{item.attributes.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

