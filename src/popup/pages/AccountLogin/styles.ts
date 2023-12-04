import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  headerContainer: {
    borderRadius: 0,
  },
  accountContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2), // Use spacing instead of padding
  },
  selectAcctText: {
    fontSize: theme.typography.fontSize, // Use typography instead of font
    fontWeight: theme.typography.fontWeightBold, // Use typography instead of fontWeight
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  accountSelect: {
    flex: 1,
    padding: theme.spacing(1), // Use spacing instead of padding
    marginBottom: theme.spacing(1), // Use spacing instead of padding
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  loginContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(2), // Use spacing instead of padding
    paddingRight: theme.spacing(2), // Use spacing instead of padding
  },
  loginButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
}));

export default useStyles;
