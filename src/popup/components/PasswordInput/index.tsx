// PasswordTextField.tsx
import React, { FC } from 'react';
import { TextField, Typography } from '@mui/material';
import cx from 'classnames';
import { handleEnterPress } from '../../../utils';
import useStyles from './styles';

interface PasswordTextFieldProps {
  classNames?: string;
  autoFocus?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnterPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const PasswordTextField: FC<PasswordTextFieldProps> = ({
  classNames,
  autoFocus,
  placeholder,
  helperText,
  error,
  errorText,
  onChange,
  onEnterPress,
}: PasswordTextFieldProps) => {
  const classes = useStyles();

  return (
    <div className={cx(classes.container, classNames)}>
      <TextField
        // className={classes.textField}
        required
        autoFocus={autoFocus}
        type="password"
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        InputProps={{
          // classes: { input: classes.input },
        }}
        onChange={onChange}
        onKeyPress={(e) => handleEnterPress(e, onEnterPress)}
      />
      {error && errorText && (
        <Typography className={classes.errorText}>{errorText}</Typography>
      )}
    </div>
  );
};

export default PasswordTextField;
