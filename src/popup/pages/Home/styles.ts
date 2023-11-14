import { createStyles, Theme } from '@material-ui/core';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      margin: theme.spacing(2),
    },
  });

export default styles;
