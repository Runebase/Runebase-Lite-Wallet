import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
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
   errorText: {
     fontSize: '10px', // Use typography instead of font
     color: 'red', // Use error color from the palette
     marginTop: theme.spacing(1), // Use spacing instead of unit
   },
   selectOrTextField: {
     width: '100%',
  },
}));

export default useStyles;
