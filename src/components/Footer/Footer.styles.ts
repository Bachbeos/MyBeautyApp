import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#e41f07',
  text: '#6b7280',
  bg: '#ffffff',
  border: '#f3f4f6',
};

export default StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  copyrightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
  },
  linkPrimary: {
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.text,
    paddingHorizontal: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
});
