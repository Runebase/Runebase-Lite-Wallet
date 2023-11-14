import { createStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => createStyles({
  card: {
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  cardContent: {
    background: theme.palette.primary.main, // Use primary color from the palette
  },
});

export default styles;
