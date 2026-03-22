import React from 'react';
import { TextField, Typography } from '@mui/material';
import cx from 'classnames';

import useStyles from './styles';
import { handleEnterPress } from '../../../utils';

const BorderTextField: React.FC<any> = ({
  label,
  classNames,
  className,
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
    <div className={cx(classes.container, classNames, className)}>
      <TextField
        className={classes.textField}
        label={label}
        required
        fullWidth
        type="text"
        placeholder={placeholder}
        error={!!error}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        aria-label={label || placeholder}
      />
      {error && errorText && (
        <Typography className={classes.errorText}>{errorText}</Typography>
      )}
    </div>
  );
};

export default BorderTextField;
