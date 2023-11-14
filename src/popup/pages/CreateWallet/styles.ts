import { createStyles, Theme } from '@material-ui/core/styles';
// import { FontWeightProperty } from 'csstype';

const styles = (theme: Theme) => createStyles({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(6),
  },
  fieldContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  walletNameField: {
    marginBottom: theme.spacing(2),
  },
  loginButton: {
    height: theme.spacing(8),
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(2),
    display: 'flex',
  },
  selectionDividerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  selectionDivider: {
    flex: 1,
  },
  selectionDividerText: {
    // fontSize: theme.typography.fontSize,
    // fontWeight: theme.typography.fontWeightBold as FontWeightProperty,
    // color: theme.palette.text.secondary,
    margin: `0px ${theme.spacing(2)}`,
  },
  importButton: {
    minHeight: 0,
    padding: 0,
  },
});

export default styles;
