import React, { FC, useState } from 'react';
import {
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  const { classes } = useStyles();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cx(classes.container, classNames)}>
      <TextField
        required
        autoFocus={autoFocus}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        aria-label={placeholder || 'Password'}
        onChange={onChange}
        onKeyPress={(e) => handleEnterPress(e, onEnterPress)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {error && errorText && (
        <Typography className={classes.errorText}>{errorText}</Typography>
      )}
    </div>
  );
};

export default PasswordTextField;
