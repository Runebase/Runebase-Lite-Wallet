import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
//import { FontWeightProperty } from 'csstype';


const styles = (theme: Theme) => createStyles({
  root: {
    margin: theme.spacing(2), // Use spacing instead of pixel value
    flexDirection: 'row',
    display: 'flex',
  },
  leftButtonsContainer: {
    marginRight: theme.spacing(1), // Use spacing instead of pixel value
    cursor: 'pointer',
  },
  backIconButton: {
    width: theme.spacing(4), // Use spacing instead of pixel value
    height: theme.spacing(4), // Use spacing instead of pixel value
  },
  backButton: {
    //fontSize: theme.typography.fontSize, // Use typography instead of md
    '&.white': {
      //color: theme.palette.secondary.main,
    },
  },
  settingsIconButton: {
    width: theme.spacing(4), // Use spacing instead of pixel value
    height: theme.spacing(4), // Use spacing instead of pixel value
  },
  settingsButton: {
    fontSize: theme.typography.fontSizeLarge, // Use typography instead of 18
    '&.white': {
     // color: theme.palette.secondary.main,
    },
  },
  locationContainer: {
    height: theme.spacing(4), // Use spacing instead of pixel value
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    //fontSize: theme.typography.fontSize, // Use typography instead of md
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography for font weight
    '&.white': {
      //color: theme.palette.secondary.main,
    },
  },
});

export default styles;
