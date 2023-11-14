import createStyles from '@mui/styles/createStyles';
//import { FontWeightProperty } from 'csstype';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = () => createStyles({
  logoContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 112,
    height: 112,
  },
  logoText: {
    //fontSize: theme.typography.h4.fontSize, // Use typography instead of hardcoding font size
    //fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography for font weight
    //color: theme.palette.primary.main,
    alignSelf: 'center',
  },
  version: {
    //fontSize: theme.typography.fontSize, // Use typography instead of sm
    //color: theme.palette.text.secondary,
  },
});

export default styles;
