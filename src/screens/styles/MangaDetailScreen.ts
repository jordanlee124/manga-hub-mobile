import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', padding: 16, gap: 12 },
  cover: { width: 120, height: 170, borderRadius: 6 },
  headerInfo: { flex: 1 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  status: { color: '#e74c3c', fontSize: 13, textTransform: 'capitalize', marginBottom: 4 },
  meta: { color: '#888', fontSize: 12, marginBottom: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: { backgroundColor: '#0f3460', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { color: '#aaa', fontSize: 10 },
  chaptersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  readProgress: { color: '#888', fontWeight: '400' },
  description: { color: '#ccc', fontSize: 13, lineHeight: 20, marginHorizontal: 16, marginBottom: 12 },
});
