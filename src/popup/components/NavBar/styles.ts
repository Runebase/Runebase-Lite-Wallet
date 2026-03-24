import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    padding: `0 ${theme.spacing(1)}`,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
  },
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: theme.spacing(0.5),
  },
  locationText: {
    flex: 1,
    fontWeight: theme.typography.fontWeightBold,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  rightContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: theme.spacing(0.5),
  },
  connectionDot: {
    fontSize: 14,
    cursor: 'pointer',
  },
  blockHeight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    fontSize: 11,
    opacity: 0.85,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  blockIcon: {
    fontSize: 12,
  },
}));

export default useStyles;
