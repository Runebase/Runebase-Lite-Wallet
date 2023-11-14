import { Theme } from '@mui/material/styles';

import createStyles from '@mui/styles/createStyles';

const styles = (theme: Theme) => createStyles({
  card: {
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius, // Use shape instead of border
  },
  cardContent: {
    //background: theme.palette.primary.main, // Use primary color from the palette
  },
});

export default styles;
