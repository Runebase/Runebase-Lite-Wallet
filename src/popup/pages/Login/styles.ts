import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2), // Use spacing instead of padding
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  masterPwNote: {
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of font
    // color: theme.palette.gradientPurple,
  },
  loginButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    borderRadius: theme.spacing(2), // Adjust to your desired value using spacing
  },
}));

export default useStyles;
