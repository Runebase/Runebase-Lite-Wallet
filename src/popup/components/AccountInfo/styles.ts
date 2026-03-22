import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minHeight: 44,
  },
  tokenAmount: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  token: {
    fontSize: theme.typography.body1.fontSize,
    flex: 1,
    alignSelf: 'flex-end',
    marginBottom: theme.spacing(0.5),
  },
  balanceUSD: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
  },
  actionButton: {
    fontSize: theme.typography.body2.fontSize,
  },
}));

export default useStyles;
