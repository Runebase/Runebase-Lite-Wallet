import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    padding: `0 ${theme.spacing(1)}`,
    minHeight: 48,
    position: 'relative',
  },
  leftButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  },
  locationText: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: theme.typography.fontWeightBold,
    textAlign: 'center',
    maxWidth: '60%',
    pointerEvents: 'none',
  },
  rightContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: 'auto',
    zIndex: 1,
  },
  connectionIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    cursor: 'pointer',
  },
  connectionDot: {
    fontSize: 14,
  },
  connectionLabel: {
    display: 'none',
    fontSize: theme.typography.caption.fontSize,
    [theme.breakpoints.up('sm')]: {
      display: 'inline',
    },
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
