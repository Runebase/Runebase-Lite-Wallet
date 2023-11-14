import { createStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    flex: 1,
    padding: theme.spacing(1), // Use spacing instead of padding
    border: '1px solid black',
    // borderRadius: theme.border.radius,
  },
  textFieldInput: {
    // fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
  },
  errorText: {
    // fontSize: theme.typography.caption.fontSize, // Adjust the font size based on your design
    // color: theme.palette.error.main,
    marginTop: theme.spacing(1), // Use spacing instead of padding
  },
});

export default styles;
