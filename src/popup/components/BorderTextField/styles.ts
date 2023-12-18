import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';

const styles = (theme: Theme) => createStyles({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  textField: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.error.main,
    marginTop: theme.spacing(1),
  },
});

export default styles;
