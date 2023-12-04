import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  mnemonicTilesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the tiles horizontally
    marginBottom: theme.spacing(2), // Add some margin at the bottom
  },
  mnemonicTile: {
    border: `1px solid ${theme.palette.divider}`,
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    boxSizing: 'border-box',
    borderRadius: theme.shape.borderRadius,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center', // Center the text horizontally
  },
  tileNumber: {
    fontSize: theme.typography.fontSizeSmall,
    color: theme.palette.text.secondary, // Light color for numbers
  },
  tileWord: {
    fontSize: theme.typography.h6.fontSize, // Larger size for words
    fontWeight: theme.typography.fontWeightBold, // Bold for words
    color: theme.palette.text.primary, // Dark color for words
  },
  tileContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(173, 216, 230, 0.2)', // Grayish background color with a tint of aqua
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  disabledInput: {
    border: 'none',
    backgroundColor: 'transparent',
    width: '100%',
  },
  warningText: {
    fontSize: theme.typography.fontSizeSmall,
    color: theme.palette.warning.main,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column', // Display icon and text in a column layout
    alignItems: 'center',
  },
  warningIcon: {
    color: theme.palette.warning.main,
    marginBottom: theme.spacing(1), // Add some spacing between the icon and text
  },
}));

export default useStyles;
