import { createStyles, Theme } from '@material-ui/core/styles';
// import { FontWeightProperty } from 'csstype';

const styles = (theme: Theme) => createStyles({
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
  fieldsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  fieldHeading: {
    marginBottom: theme.spacing(0.5), // Use spacing instead of halfUnit
    fontSize: '12px', // Use typography instead of font
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
  },
  fieldContainer: {
    marginBottom: theme.spacing(1), // Use spacing instead of sm
  },
  fieldContentContainer: {
    padding: theme.spacing(1), // Use spacing instead of xs
    border: '1px solid black',
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  errorText: {
    fontSize: '10px', // Use typography instead of font
    color: theme.palette.error.main, // Use error color from the palette
    marginTop: theme.spacing(1), // Use spacing instead of unit
  },
  fieldTextOrInput: {
    fontSize: '12px', // Use typography instead of font
  },
  fieldInput: {
    padding: 0,
  },
  selectOrTextField: {
    width: '100%',
    height: theme.spacing(1.7), // Adjust to your desired value using spacing
    fontSize: '12px', // Use typography instead of font
  },
  buttonFieldHeadingContainer: {
    width: '100%',
    flexDirection: 'row',
    display: 'inline-flex',
    alignItems: 'center',
  },
  buttonFieldHeadingTextContainer: {
    flex: 1,
  },
  fieldButtonText: {
    fontSize: '12px', // Use typography instead of font
  },
  fieldButton: {
    minWidth: 0,
    minHeight: 0,
    padding: '0 4px',
    fontSize: '10px', // Use typography instead of font
  },
  fieldTextAdornment: {
    fontSize: '12px', // Use typography instead of font
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    marginLeft: theme.spacing(1), // Use spacing instead of sm
    display: 'flex',
    alignItems: 'center',
  },
  sendButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
});

export default styles;
