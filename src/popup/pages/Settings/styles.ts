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
    fontSize: theme.typography.fontSizeSmall, // Use typography instead of font
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
  },
  fieldContainer: {
    marginBottom: theme.spacing(2), // Use spacing instead of md
  },
  fieldContentContainer: {
    padding: theme.spacing(1), // Use spacing instead of sm
    border: '1px solid black',
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  select: {
    width: '100%',
  },
  selectTypography: {
    fontSize: theme.typography.fontSizeMedium, // Use typography instead of md
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
  },
});

export default styles;
