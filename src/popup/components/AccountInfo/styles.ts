import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2), // Use spacing instead of padding
  },
  acctName: {
    fontSize: theme.typography.h4.fontSize, // Adjust the font size based on your design
    fontWeight: theme.typography.fontWeightBold, // Use typography properties
    // color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  address: {
    fontSize: theme.typography.caption.fontSize, // Adjust the font size based on your design
    // color: theme.palette.secondary.main,
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    display: 'inline-flex',
  },
  tokenAmount: {
    fontSize: theme.typography.h6.fontSize, // Adjust the font size based on your design
    fontWeight: theme.typography.fontWeightBold, // Use typography properties
    // color: theme.palette.secondary.main,
    marginLeft: theme.spacing(1), // Use spacing instead of padding
    marginRight: theme.spacing(1), // Use spacing instead of padding
  },
  token: {
    fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
    // color: theme.palette.secondary.main,
    flex: 1,
    alignSelf: 'flex-end',
    marginBottom: theme.spacing(0.5), // Use spacing instead of padding
  },
  rightArrow: {
    fontSize: 22,
    // color: theme.palette.secondary.main,
    alignSelf: 'center',
  },
  balanceUSD: {
    fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
    // color: theme.palette.secondary.main,
    // marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  actionButtonsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`, // Use spacing instead of padding
    marginRight: theme.spacing(1), // Use spacing instead of padding
    fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
  },
  tokenContainer: {
    marginLeft: '24px',
  }
}));

export default useStyles;