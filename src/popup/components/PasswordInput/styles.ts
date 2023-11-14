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
    padding: theme.spacing(1), // Use spacing instead of pixel value
    //fontSize: theme.typography.fontSize, // Use typography instead of sm
    border: '2px solid black',
    borderRadius: theme.shape.borderRadius, // Use shape property for border radius
  },
  input: {
    //fontSize: theme.typography.fontSize, // Use typography instead of sm
  },
  errorText: {
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of xs
    //color: theme.palette.error.main, // Use palette for error text color
    marginTop: theme.spacing(1), // Use spacing instead of pixel value
  },
});

export default styles;
