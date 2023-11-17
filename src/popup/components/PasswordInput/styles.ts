import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  errorText: {
    fontSize: theme.typography.fontSizeSmall,
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;