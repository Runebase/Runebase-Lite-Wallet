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
  },
  accountDetailPaper: {
    // background: theme.palette.gradientPurple.main, // Use palette instead of color
    borderRadius: 0,
  },
  tabsPaper: {
    borderRadius: 0,
  },
  tab: {
    flex: 1,
  },
  list: {
    flex: 1,
    padding: `0 ${theme.spacing(2)}`, // Use spacing instead of md
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  listItem: {
    width: '100%',
    padding: `${theme.spacing(2)} 0`, // Use spacing instead of md
    cursor: 'pointer',
    display: 'inline-flex',
  },
  txInfoContainer: {
    flex: 1,
  },
  txState: {
    // fontSize: theme.typography.fontSizeSmall, // Use typography instead of sm
    textTransform: 'uppercase',
    marginBottom: theme.spacing(1), // Use spacing instead of unit
    '&.pending': {
      // color: theme.palette.orange.main, // Use palette instead of color
    },
  },
  txId: {
    // fontSize: theme.typography.fontSizeLarge, // Use typography instead of lg
    // color: theme.palette.text.primary,
  },
  txTime: {
    // fontSize: theme.typography.fontSizeMedium, // Use typography instead of md
    // color: theme.palette.text.secondary,
  },
  arrowRight: {
    // fontSize: theme.typography.fontSize, // Use typography instead of icon size
    // color: theme.palette.gray.main, // Use palette instead of color
    marginLeft: theme.spacing(1), // Use spacing instead of xs
  },
  tokenInfoContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenName: {
    flex: 1,
    // fontSize: theme.typography.fontSizeLarge, // Use typography instead of lg
    // color: theme.palette.text.primary,
  },
  tokenContainer: {
    display: 'inline-flex',
  },
  tokenAmount: {
    // fontSize: theme.typography.fontSizeLarge, // Use typography instead of lg
    // color: theme.palette.text.primary,
    marginRight: theme.spacing(1), // Use spacing instead of unit
  },
  tokenTypeContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenType: {
    // fontSize: theme.typography.fontSizeSmall, // Use typography instead of xs
    // color: theme.palette.text.secondary,
  },
  tokenDeleteButton: {
    minHeight: '0px',
    minWidth: '0px',
    flex: 'none',
  },
  bottomButtonWrap: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing(2)} 0px`, // Use spacing instead of md
    '&.center': {
      justifyContent: 'center',
    },
  },
  bottomButton: {
    minWidth: 0,
    minHeight: 0,
    padding: `0px ${theme.spacing(1)}`, // Use spacing instead of unit
  },
}));

export default useStyles;
