import { createStyles, Theme } from '@material-ui/core/styles';
import { FontWeightProperty } from 'csstype';

const styles = (theme: Theme) => createStyles({
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
    fontSize: theme.typography.h4.fontSize, // Use typography instead of hardcoding font size
    fontWeight: theme.typography.fontWeightBold as FontWeightProperty, // Use typography for font weight
    color: theme.palette.primary.main,
    alignSelf: 'center',
  },
  version: {
    fontSize: theme.typography.fontSize, // Use typography instead of sm
    color: theme.palette.text.secondary,
  },
});

export default styles;
