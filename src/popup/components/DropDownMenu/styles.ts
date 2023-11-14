import { createStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({
  menuButton: {
    height: 24,
    minWidth: 0,
    minHeight: 0,
    padding: `0 ${theme.spacing(1)}`, // Use spacing instead of padding
    // color: theme.palette.text.primary,
    textTransform: 'none',
  },
});

export default styles;
