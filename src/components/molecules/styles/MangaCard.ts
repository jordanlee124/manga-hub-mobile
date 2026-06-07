import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: '#16213e',
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: '48%',
  },
  cover: { width: '100%', aspectRatio: 0.7 },
  info: { padding: 8 },
  title: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  status: { color: '#888', fontSize: 11, textTransform: 'capitalize' },
});
