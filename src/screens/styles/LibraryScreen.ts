import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { color: '#888', fontSize: 13, textAlign: 'center' },
  list: { paddingHorizontal: 8, paddingVertical: 12 },
  row: { justifyContent: 'space-between', marginHorizontal: 4 },
});
