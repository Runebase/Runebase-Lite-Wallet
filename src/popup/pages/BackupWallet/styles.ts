import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  topContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
  },
  walletCreatedHeader: {
    marginBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    textDecoration: 'underline',
    marginBottom: theme.spacing(1),
  },
  content: {
    marginBottom: theme.spacing(2),
    wordBreak: 'break-all',
  },
}));

export default useStyles;