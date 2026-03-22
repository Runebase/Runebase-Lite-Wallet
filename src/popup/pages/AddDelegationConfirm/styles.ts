import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export default useStyles;
