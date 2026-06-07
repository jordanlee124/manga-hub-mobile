import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFilters } from '../context/FiltersContext';
import { fetchTags, type TagItem } from '../api/mangadex';
import {
  DEFAULT_FILTERS,
  type MangaFilters,
  type ContentRating,
  type MangaStatus,
  type SortOption,
} from '../types/filters';
import Chip from '../components/atoms/Chip';
import { styles } from './styles/FilterScreen';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most Followed', value: 'followedCount' },
  { label: 'Top Rated',     value: 'rating' },
  { label: 'Latest',        value: 'latestUpdated' },
  { label: 'Newest',        value: 'newest' },
  { label: 'Oldest',        value: 'oldest' },
];

const STATUS_OPTIONS: { label: string; value: MangaStatus }[] = [
  { label: 'Ongoing',   value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Hiatus',    value: 'hiatus' },
  { label: 'Cancelled', value: 'cancelled' },
];

const RATING_OPTIONS: { label: string; value: ContentRating }[] = [
  { label: 'Safe',       value: 'safe' },
  { label: 'Suggestive', value: 'suggestive' },
  { label: 'Erotica',    value: 'erotica' },
];

const TAG_GROUP_ORDER = ['genre', 'theme', 'format', 'content'];
const TAG_GROUP_LABELS: Record<string, string> = {
  genre: 'Genre', theme: 'Theme', format: 'Format', content: 'Content',
};

export default function FilterScreen() {
  const navigation = useNavigation();
  const { filters, setFilters } = useFilters();
  const [local, setLocal] = useState<MangaFilters>(filters);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    fetchTags().then(setTags).finally(() => setTagsLoading(false));
  }, []);

  const toggleMulti = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const handleApply = () => { setFilters(local); navigation.goBack(); };
  const handleReset = () => setLocal(DEFAULT_FILTERS);

  const tagsByGroup = TAG_GROUP_ORDER.reduce<Record<string, TagItem[]>>((acc, g) => {
    acc[g] = tags.filter(t => t.group === g).sort((a, b) => a.name.localeCompare(b.name));
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.chipRow}>
          {SORT_OPTIONS.map(o => (
            <Chip
              key={o.value}
              label={o.label}
              active={local.sortBy === o.value}
              onPress={() => setLocal(p => ({ ...p, sortBy: o.value }))}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Publication Status</Text>
        <View style={styles.chipRow}>
          {STATUS_OPTIONS.map(o => (
            <Chip
              key={o.value}
              label={o.label}
              active={local.status.includes(o.value)}
              onPress={() => setLocal(p => ({ ...p, status: toggleMulti(p.status, o.value) }))}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Content Rating</Text>
        <View style={styles.chipRow}>
          {RATING_OPTIONS.map(o => (
            <Chip
              key={o.value}
              label={o.label}
              active={local.contentRating.includes(o.value)}
              onPress={() => setLocal(p => ({ ...p, contentRating: toggleMulti(p.contentRating, o.value) }))}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Year</Text>
        <TextInput
          style={styles.yearInput}
          value={local.year}
          onChangeText={v => setLocal(p => ({ ...p, year: v.replace(/\D/g, '') }))}
          placeholder="e.g. 2023"
          placeholderTextColor="#555"
          keyboardType="numeric"
          maxLength={4}
        />

        <Text style={styles.sectionTitle}>Tags</Text>
        {tagsLoading ? (
          <ActivityIndicator color="#e74c3c" style={{ marginVertical: 12 }} />
        ) : (
          TAG_GROUP_ORDER.map(group => {
            const groupTags = tagsByGroup[group];
            if (!groupTags?.length) return null;
            return (
              <View key={group}>
                <Text style={styles.groupLabel}>{TAG_GROUP_LABELS[group]}</Text>
                <View style={styles.chipRow}>
                  {groupTags.map(tag => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      active={local.includedTags.includes(tag.id)}
                      onPress={() => setLocal(p => ({ ...p, includedTags: toggleMulti(p.includedTags, tag.id) }))}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

