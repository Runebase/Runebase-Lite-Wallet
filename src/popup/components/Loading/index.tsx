import React from 'react';
import { Typography } from '@mui/material';
import cx from 'classnames';
import useStyles from './styles';


const Loading = () => {
  const classes = useStyles();

  return (
    <div className={cx(classes.root, 'loading')}>
      <div className={classes.container}>
        <Typography className={classes.text}>Loading...</Typography>
        <div className={classes.anim9}></div>
      </div>
    </div>
  );
};

export default Loading;
