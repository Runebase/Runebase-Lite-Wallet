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
    overflow: 'auto',
    padding: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(0.5),
  },
  value: {
    fontSize: theme.typography.body2.fontSize,
    wordBreak: 'break-all',
  },
  amountPositive: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  amountNegative: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  feeText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
  },
  txidText: {
    fontSize: '0.75rem',
    wordBreak: 'break-all',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  explorerButton: {
    marginTop: theme.spacing(2),
  },
}));

export default useStyles;
