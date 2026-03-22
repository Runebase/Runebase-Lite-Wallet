import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    [theme.breakpoints.up('sm')]: {
      width: 96,
      height: 96,
    },
  },
  logoText: {
    fontSize: theme.typography.h5.fontSize,
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
