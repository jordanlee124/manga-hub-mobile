import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', margin: 12, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  goButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  goText: { color: '#fff', fontWeight: '600' },
  filterButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
