import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
// import { FontWeightProperty } from 'csstype';

const styles = (theme: Theme) => createStyles({
  root: {
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
  fieldContentContainer: {
    padding: theme.spacing(1), // Use spacing instead of padding
    border: '1px solid black',
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  typeSelect: {
    width: '100%',
  },
  menuItemTypography: {
    // fontSize: theme.typography.fontSizeMedium, // Use typography instead of font
  },
  mnemonicPrKeyTextField: {
    flex: 1,
    border: '1px solid black',
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  mnemonicPrKeyFieldInput: {
    padding: theme.spacing(1), // Use spacing instead of padding
    // fontSize: theme.typography.fontSize, // Use typography instead of font
    // lineHeight: theme.typography.lineHeight, // Use typography instead of lineHeight
  },
  borderTextFieldContainer: {
    marginTop: theme.spacing(2), // Use spacing instead of padding
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
});

export default styles;
