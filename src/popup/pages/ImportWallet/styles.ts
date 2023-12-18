import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2), // Use spacing instead of padding
    marginRight: theme.spacing(2), // Use spacing instead of padding
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  headerText: {
    // fontSize: theme.typography.h6.fontSize, // Use typography instead of hard-coded value
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    // color: theme.palette.text.primary,
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  inputContainer: {
    flex: 1,
  },
  fieldContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2), // Use spacing instead of padding
  },
  fieldHeading: {
    marginBottom: theme.spacing(1), // Use spacing instead of unit
    // fontSize: theme.typography.fontSize, // Use typography instead of font
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
  },
  typeSelect: {
    width: '100%',
  },
  menuItemTypography: {
    // fontSize: theme.typography.fontSizeMedium, // Use typography instead of font
  },
  mnemonicPrKeyFieldInput: {
    padding: theme.spacing(1), // Use spacing instead of padding
    // fontSize: theme.typography.fontSize, // Use typography instead of font
    // lineHeight: theme.typography.lineHeight, // Use typography instead of lineHeight
  },
  importButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    marginBottom: theme.spacing(1), // Use spacing instead of padding
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
    display: 'flex',
  },
  cancelButton: {
    minHeight: 0,
    padding: 0,
  },
  errorText: {
    // fontSize: theme.typography.fontSizeExtraSmall, // Use typography instead of font
    // color: theme.palette.error.main, // Use error color from the palette
    marginTop: theme.spacing(1), // Use spacing instead of unit
  },
}));

export default useStyles;
