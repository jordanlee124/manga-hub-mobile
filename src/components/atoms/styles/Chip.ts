import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#16213e',
  },
  active: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  text: { color: '#aaa', fontSize: 13 },
  activeText: { color: '#fff', fontWeight: '600' },
});
