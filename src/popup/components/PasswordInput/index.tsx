import React, { FC } from 'react';
import { TextField, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';

import styles from './styles';
import { handleEnterPress } from '../../../utils';

const PasswordTextField: FC<any> = ({
  classes,
  classNames,
  autoFocus,
  placeholder,
  helperText,
  error,
  errorText,
  onChange,
  onEnterPress,
}: any) => (
  <div className={cx(classes.container, classNames)}>
    <TextField
      className={classes.textField}
      required
      autoFocus={autoFocus}
      type="password"
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      InputProps={{
        disableUnderline: true,
        classes: { input: classes.input },
      }}
      onChange={onChange}
      onKeyPress={(e) => handleEnterPress(e, onEnterPress)}
    />
    {error && errorText && (
      <Typography className={classes.errorText}>{errorText}</Typography>
    )}
  </div>
);

export default withStyles(styles)(PasswordTextField);
