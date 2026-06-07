import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles/ChapterRow';

interface ChapterRowProps {
  chapterNum: string;
  title: string | null;
  pages: number;
  isRead: boolean;
  versionsCount: number;
  expanded: boolean;
  onPress: () => void;
  onToggleVersions: () => void;
}

export function ChapterRow({
  chapterNum, title, pages, isRead, versionsCount, expanded, onPress, onToggleVersions,
}: ChapterRowProps) {
  const hasVersions = versionsCount > 1;
  return (
    <TouchableOpacity
      style={[styles.row, isRead && styles.rowRead]}
      onPress={onPress}
    >
      <Text style={[styles.num, isRead && styles.numRead]}>Ch. {chapterNum}</Text>
      <Text style={[styles.title, isRead && styles.titleRead]} numberOfLines={1}>
        {title ?? `Chapter ${chapterNum}`}
      </Text>
      <View style={styles.meta}>
        {pages > 0 && <Text style={styles.pages}>{pages}p</Text>}
        {isRead && <Text style={styles.check}>✓</Text>}
        {hasVersions && (
          <TouchableOpacity
            onPress={onToggleVersions}
            style={styles.versionBadge}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.versionBadgeText}>
              {versionsCount} ver {expanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ChapterVersionRowProps {
  versionIndex: number;
  groupName: string;
  pages: number;
  isRead: boolean;
  onPress: () => void;
}

export function ChapterVersionRow({ versionIndex, groupName, pages, isRead, onPress }: ChapterVersionRowProps) {
  return (
    <TouchableOpacity
      style={[styles.versionRow, isRead && styles.rowRead]}
      onPress={onPress}
    >
      <Text style={styles.versionIndex}>{versionIndex}</Text>
      <Text style={styles.versionGroup} numberOfLines={1}>{groupName}</Text>
      <View style={styles.meta}>
        {pages > 0 && <Text style={styles.pages}>{pages}p</Text>}
        {isRead && <Text style={styles.check}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

