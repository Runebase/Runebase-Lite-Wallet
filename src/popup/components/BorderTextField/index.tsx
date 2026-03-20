import React from 'react';
import { TextField, Typography } from '@mui/material';
import cx from 'classnames';

import useStyles from './styles';
import { handleEnterPress } from '../../../utils';

const BorderTextField: React.FC<any> = ({
  label,
  classNames,
  placeholder,
  error,
  errorText,
  onChange,
  onEnterPress,
}: any) => {
  const { classes } = useStyles();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEnterPress(e, onEnterPress);
    }
  };

  return (
    <div className={cx(classes.container, classNames)}>
      <TextField
        className={classes.textField}
        label={label}
        required
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      {error && errorText && (
        <Typography className={classes.errorText}>{errorText}</Typography>
      )}
    </div>
  );
};

export default BorderTextField;
