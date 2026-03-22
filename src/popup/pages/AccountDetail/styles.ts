import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  tab: {
    flex: 1,
  },
  listItem: {
    width: '100%',
    padding: `${theme.spacing(1.5)} 0`,
    display: 'flex',
    minHeight: 64,
    gap: theme.spacing(1),
  },
  txInfoContainer: {
    flex: 1,
    minWidth: 0,
  },
  txState: {
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1.3,
  },
  txId: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'Roboto Mono, monospace',
  },
  txTime: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.3,
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
    alignSelf: 'center',
  },
  tokenContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  tokenAmount: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  tokenTypeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  tokenType: {
    fontSize: theme.typography.caption.fontSize,
  },
}));

export default useStyles;
