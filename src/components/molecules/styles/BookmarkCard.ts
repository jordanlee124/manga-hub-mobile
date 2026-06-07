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
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
