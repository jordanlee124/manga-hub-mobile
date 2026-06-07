import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  rowRead: { opacity: 0.5 },
  num: { color: '#e74c3c', fontSize: 13, fontWeight: '600', width: 60 },
  numRead: { color: '#888' },
  title: { color: '#ddd', fontSize: 13, flex: 1 },
  titleRead: { color: '#888' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pages: { color: '#888', fontSize: 11 },
  check: { color: '#2ecc71', fontSize: 12, fontWeight: '700' },
  versionBadge: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  versionBadgeText: { color: '#aaa', fontSize: 10, fontWeight: '600' },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingLeft: 32,
    backgroundColor: '#131929',
    borderTopWidth: 1,
    borderTopColor: '#16213e',
  },
  versionIndex: { color: '#555', fontSize: 12, width: 20 },
  versionGroup: { color: '#bbb', fontSize: 12, flex: 1 },
});
