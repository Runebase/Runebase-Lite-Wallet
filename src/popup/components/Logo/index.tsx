import React, { FC } from 'react';
import { Typography } from '@mui/material';
import useStyles from './styles';
import { extensionInfoProvider, getImageUrl } from '../../abstraction';

// Usage example
const Logo: FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.logoContainer}>
      <img className={classes.logo} src={getImageUrl('images/logo.png')} alt={'Logo'} />
      <Typography className={classes.logoText}>Runebase Light</Typography>
      <Typography className={classes.version}>v{extensionInfoProvider.getVersion()}</Typography>
    </div>
  );
};

export default Logo;
