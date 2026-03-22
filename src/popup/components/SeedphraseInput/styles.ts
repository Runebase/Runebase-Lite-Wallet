import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  mnemonicTilesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing(1),
  },
  mnemonicTile: {
    textAlign: 'center',
    boxSizing: 'border-box',
    padding: theme.spacing(0.5),
  },
  tileNumber: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
  },
  tileContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    minHeight: 44,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: 'none',
      },
    },
    '& .MuiInputBase-input': {
      padding: `${theme.spacing(0.75)} ${theme.spacing(0.5)}`,
      fontSize: theme.typography.body2.fontSize,
    },
  },
}));

export default useStyles;
