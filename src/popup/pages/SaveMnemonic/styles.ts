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
  topContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  walletCreatedHeader: {
    // fontSize: theme.typography.h6.fontSize, // Use typography instead of hard-coded value
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography instead of fontWeight
    marginBottom: theme.spacing(1), // Use spacing instead of padding
  },
  mnemonicText: {
    padding: theme.spacing(2), // Use spacing instead of padding
    marginBottom: theme.spacing(2), // Use spacing instead of padding
    // fontSize: theme.typography.fontSizeLarge, // Use typography instead of font
    fontFamily: 'Roboto Mono, monospace',
    // color: theme.palette.text.primary,
    border: '1px solid black',
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  warningText: {
    // fontSize: theme.typography.fontSizeSmall, // Use typography instead of font
    // lineHeight: theme.typography.lineHeightMedium, // Use typography instead of lineHeight
    // color: theme.palette.text.secondary,
  },
  actionButton: {
    height: theme.spacing(8), // Adjust to your desired value using spacing
    // borderRadius: theme.shape.borderRadius, // Use shape instead of border
    marginBottom: theme.spacing(1), // Use spacing instead of padding
    '&.marginBottom': {
      marginBottom: theme.spacing(1), // Use spacing instead of padding
    },
  },
});

export default styles;
