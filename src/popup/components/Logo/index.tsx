import React, { FC } from 'react';
import { Typography } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

import styles from './styles';

const Logo: FC<any> = ({ classes }: any) => (
  <div className={classes.logoContainer}>
    <img className={classes.logo} src={chrome.runtime.getURL('images/logo.png')} alt={'Logo'} />
    <Typography className={classes.logoText}>RunebaseChrome</Typography>
    <Typography className={classes.version}>version {chrome.runtime.getManifest().version}</Typography>
  </div>
);

export default withStyles(styles)(Logo);
