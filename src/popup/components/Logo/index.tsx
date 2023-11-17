import React, { FC } from 'react';
import { Typography } from '@mui/material';
import useStyles from './styles';

const Logo: FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.logoContainer}>
      <img className={classes.logo} src={chrome.runtime.getURL('images/logo.png')} alt={'Logo'} />
      <Typography className={classes.logoText}>RunebaseChrome</Typography>
      <Typography className={classes.version}>version {chrome.runtime.getManifest().version}</Typography>
    </div>
  );
};

export default Logo;