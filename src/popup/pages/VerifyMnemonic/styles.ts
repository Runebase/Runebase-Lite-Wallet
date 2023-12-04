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
    alignItems: 'center', // Center the content horizontally
  },
  topContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center the content horizontally
  },
  walletCreatedHeader: {
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  mnemonicText: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontFamily: 'Roboto Mono, monospace',
    border: '1px solid black',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center', // Center the text
  },
  actionButton: {
    height: theme.spacing(8),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(2),
  },
}));

export default useStyles;
