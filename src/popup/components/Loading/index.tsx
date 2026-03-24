import { Box, LinearProgress, Typography } from '@mui/material';
import Logo from '../Logo';

const Loading = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Logo />
      <Box sx={{ width: '60%', maxWidth: 200 }}>
        <LinearProgress color="primary" />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
};

export default Loading;
