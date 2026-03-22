import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.error.main,
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
