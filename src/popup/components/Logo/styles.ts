import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  logoContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 112,
    height: 112,
  },
  logoText: {
    alignSelf: 'center',
  },
  version: {},
}));

export default useStyles;
