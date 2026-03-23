import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  tab: {
    flex: 1,
  },
  listItem: {
    width: '100%',
    padding: `${theme.spacing(1)} 0`,
    display: 'flex',
    minHeight: 48,
    gap: theme.spacing(1),
    alignItems: 'center',
  },
  txInfoContainer: {
    flex: 1,
    minWidth: 0,
  },
  // Primary label — tx type or timestamp (first line, left)
  txLabel: {
    fontSize: '0.8rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  // Secondary metadata line — txid, timestamp (second line, left)
  txMeta: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'Roboto Mono, monospace',
    lineHeight: 1.4,
  },
  directionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: theme.palette.action.hover,
    flexShrink: 0,
  },
  // Right column
  amountColumn: {
    textAlign: 'right' as const,
    flexShrink: 0,
  },
  tokenContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    justifyContent: 'flex-end',
  },
  tokenAmount: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  tokenTypeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  tokenType: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
  // Tertiary metadata on right side (conf count, fee)
  amountMeta: {
    fontSize: '0.65rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.3,
  },
}));

export default useStyles;
