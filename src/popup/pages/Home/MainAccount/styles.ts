import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  cardContent: {
    //background: theme.palette.primary.main, // Use primary color from the palette
  },
}));

export default useStyles;
