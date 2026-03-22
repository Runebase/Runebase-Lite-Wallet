import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  fieldContainer: {
    marginBottom: theme.spacing(0.5),
  },
  fieldLabel: {
    fontSize: theme.typography.caption.fontSize,
  },
  addressValue: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  costFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(0.5),
  },
  fieldValue: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  fieldUnit: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
  },
  errorMessage: {
    color: theme.palette.error.main,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing(1),
  },
  sendButton: {
    marginTop: 'auto',
  },
}));

export default useStyles;
