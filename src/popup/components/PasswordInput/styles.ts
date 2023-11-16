import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    flex: 1,
    padding: theme.spacing(1),
    border: '2px solid black',
    borderRadius: theme.shape.borderRadius,
  },
  input: {},
  errorText: {
    fontSize: theme.typography.fontSizeSmall,
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;