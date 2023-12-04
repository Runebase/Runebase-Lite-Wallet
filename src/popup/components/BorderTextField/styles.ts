import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';

const styles = (theme: Theme) => createStyles({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    flex: 1,
    padding: theme.spacing(1), // Use spacing instead of padding
  },
  textFieldInput: {
    // fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize, // Adjust the font size based on your design
    color: theme.palette.error.main,
    marginTop: theme.spacing(1), // Use spacing instead of padding
  },
});

export default styles;
