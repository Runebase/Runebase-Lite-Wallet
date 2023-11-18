import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
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
    fontSize: 24,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.light,
    alignSelf: 'center',
  },
  version: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
  },
}));

export default useStyles;
