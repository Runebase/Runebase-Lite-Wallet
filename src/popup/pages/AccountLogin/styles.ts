import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  headerContainer: {
    // background: theme.palette.primary.main, // Use primary color from the palette
    borderRadius: 0,
  },
  accountContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2), // Use spacing instead of padding
  },
  selectAcctText: {
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    //color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  accountSelect: {
    flex: 1,
    padding: theme.spacing(1), // Use spacing instead of padding
    marginBottom: theme.spacing(1), // Use spacing instead of padding
    //background: theme.palette.secondary.main,
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  createAccountContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  orText: {
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.fontSizeMedium, // Use typography instead of font
    //color: theme.palette.secondary.main,
    marginBottom: theme.spacing(0.3), // Use spacing instead of margin
  },
  createAccountButton: {
    minHeight: 0,
    padding: `0 ${theme.spacing(1)}`, // Use spacing instead of unit
    fontSize: theme.typography.fontSizeMedium, // Use typography instead of font
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    //color: theme.palette.secondary.main,
  },
  permissionContainer: {
    flex: 1,
    padding: theme.spacing(2), // Use spacing instead of padding
  },
  permissionsHeader: {
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    //color: theme.palette.text.primary,
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  loginContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2), // Use spacing instead of padding
  },
  loginButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
}));

export default useStyles;
