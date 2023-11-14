import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';

const styles = (theme: Theme) => createStyles({
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
  passwordField: {
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  masterPwNote: {
    // fontSize: theme.typography.fontSize, // Use typography instead of font
    //color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  loginButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    borderRadius: theme.spacing(2), // Adjust to your desired value using spacing
  },
});

export default styles;
