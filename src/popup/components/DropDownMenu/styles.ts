import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  menuButton: {
    minWidth: 0,
    minHeight: 32,
    padding: `4px ${theme.spacing(1)}`,
    textTransform: 'none',
  },
}));

export default useStyles;
