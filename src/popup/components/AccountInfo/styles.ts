import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
// import { FontWeightProperty } from 'csstype';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2), // Use spacing instead of padding
  },
  acctName: {
    //fontSize: theme.typography.h4.fontSize, // Adjust the font size based on your design
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography properties
    //color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  address: {
    //fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
    //color: theme.palette.secondary.main,
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    display: 'inline-flex',
  },
  tokenAmount: {
    //fontSize: theme.typography.h3.fontSize, // Adjust the font size based on your design
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography properties
    //color: theme.palette.secondary.main,
    marginRight: theme.spacing(1), // Use spacing instead of padding
  },
  token: {
    //fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
    //color: theme.palette.secondary.main,
    flex: 1,
    alignSelf: 'flex-end',
    marginBottom: theme.spacing(0.5), // Use spacing instead of padding
  },
  rightArrow: {
    fontSize: 22,
    //color: theme.palette.secondary.main,
    alignSelf: 'center',
  },
  balanceUSD: {
    //fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
    //color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  actionButtonsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`, // Use spacing instead of padding
    marginRight: theme.spacing(1), // Use spacing instead of padding
    //fontSize: theme.typography.body1.fontSize, // Adjust the font size based on your design
  },
});

export default styles;
