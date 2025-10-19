import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logo: {
    paddingTop: 140,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2020',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#707070',
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  inputText: {
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  checkboxLabel: {
    color: '#1f2020',
    fontWeight: '500',
  },
  linkDanger: {
    color: '#e41f07',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#e41f07',
    borderRadius: 10,
    paddingVertical: 14,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 18,
  },
  signupText: {
    fontSize: 14,
    color: '#1f2020',
    textAlign: 'center',
    marginVertical: 10,
  },
  linkPrimary: {
    color: '#2f80ed',
    fontWeight: '700',
  },
  orContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  orText: {
    color: '#707070',
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  socialBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 50,
  },
  socialOutline: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    color: '#707070',
  },
});
