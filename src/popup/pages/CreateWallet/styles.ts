import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  fieldContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  walletNameField: {
    marginBottom: theme.spacing(2),
  },
  loginButton: {
    height: theme.spacing(8),
    borderRadius: theme.spacing(2),
    display: 'flex',
  },
}));

export default useStyles;
