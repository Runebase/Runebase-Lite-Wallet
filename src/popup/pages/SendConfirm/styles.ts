import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    margin: theme.spacing(2), // Use spacing instead of padding
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  inputContainer: {
    flex: 1,
  },
  addressFieldsContainer: {
    marginBottom: theme.spacing(8), // Use spacing instead of custom
  },
  fieldContainer: {
    width: '100%',
    borderBottom: '1px solid black',
    '&.row': {
      display: 'flex',
      flexDirection: 'row',
    },
    '&.marginSmall': {
      marginBottom: theme.spacing(2), // Use spacing instead of md
    },
    '&.marginBig': {
      marginBottom: theme.spacing(8), // Use spacing instead of custom
    },
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  fieldLabel: {
    //color: theme.palette.text.primary,
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of sm
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    '&.address': {
      lineHeight: theme.typography.lineHeightSmall, // Use typography instead of lineHeight
      marginBottom: theme.spacing(2), // Use spacing instead of md
    },
    '&.cost': {
      lineHeight: theme.typography.lineHeightMedium, // Use typography instead of lineHeight
    },
  },
  addressValue: {
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of sm
    //color: theme.palette.text.primary,
    lineHeight: theme.typography.lineHeightLarge, // Use typography instead of lineHeight
  },
  amountContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: theme.typography.fontSizeLarge, // Use typography instead of lg
    //color: theme.palette.text.primary,
    lineHeight: theme.typography.lineHeightLarge, // Use typography instead of lineHeight
  },
  unitContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  fieldUnit: {
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of sm
    textTransform: 'uppercase',
    //color: theme.palette.text.secondary,
    marginLeft: theme.spacing(1), // Use spacing instead of unit
  },
  errorMessage: {
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of sm
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    //color: theme.palette.error.main, // Use error color from the palette
    alignSelf: 'center',
    marginBottom: theme.spacing(1), // Use spacing instead of unit
  },
  sendButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
}));

export default useStyles;
