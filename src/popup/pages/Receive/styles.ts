import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(2), // Use spacing instead of padding
  },
  accountName: {
    //color: theme.palette.text.primary,
    //fontSize: theme.typography.fontSizeLarge, // Use typography instead of font
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    marginBottom: theme.spacing(1), // Use spacing instead of unit
  },
  accountAddress: {
    //color: theme.palette.text.primary,
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  amountContainer: {
    width: '100%',
    flexDirection: 'row',
    display: 'inline-flex',
  },
  tokenAmount: {
    fontSize: theme.spacing(4), // Adjust to your desired value using spacing
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    //color: theme.palette.text.primary,
    marginRight: theme.spacing(1), // Use spacing instead of xs
  },
  token: {
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    //color: theme.palette.text.primary,
    alignSelf: 'flex-end',
    marginBottom: theme.spacing(1), // Adjust to your desired value using spacing
  },
  currencyValue: {
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    //color: theme.palette.text.primary,
    marginBottom: theme.spacing(4), // Adjust to your desired value using spacing
  },
  qrCodeContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export default useStyles;
