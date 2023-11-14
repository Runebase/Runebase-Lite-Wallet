import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
//import { FontWeightProperty } from 'csstype';

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
  },
  fieldHeading: {
    marginBottom: theme.spacing(1), // Use spacing instead of unit
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: theme.spacing(8), // Use spacing instead of custom
  },
  detailContainer: {
    flex: 1,
    borderBottom: '1px solid black',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(8), // Use spacing instead of custom
  },
  fieldContentContainer: {
    padding: theme.spacing(1), // Use spacing instead of padding
    border: '1px solid black',
    // borderRadius: theme.border.radius,
  },
  errorText: {
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    //color: theme.palette.error.main, // Use error color from the palette
    marginTop: theme.spacing(1), // Use spacing instead of unit
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  detailLabel: {
    //color: theme.palette.text.primary,
    //fontSize: theme.typography.fontSize, // Use typography instead of font
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    //lineHeight: theme.typography.lineHeight, // Use typography instead of lineHeight
  },
  valueContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: theme.typography.fontSizeLarge, // Adjust to your desired value
    //color: theme.palette.text.primary,
    lineHeight: theme.typography.lineHeightLarge, // Adjust to your desired value
  },
  addButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    borderRadius: theme.spacing(2), // Adjust to your desired value using spacing
  },
});

export default styles;
