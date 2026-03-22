import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.error.main,
    marginTop: theme.spacing(0.5),
  },
  addButton: {
    height: theme.spacing(6),
    borderRadius: theme.spacing(2),
  },
}));

export default useStyles;
