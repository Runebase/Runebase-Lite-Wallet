import React, { useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Stack,
} from '@mui/material';

import PageLayout from '../../components/PageLayout';
import { handleEnterPress } from '../../../utils';
import useStyles from './styles';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  validateContractAddress,
  addToken,
  selectContractAddressFieldError,
  selectTokenAlreadyInListError,
  selectAddTokenButtonDisabled,
  resetAddToken,
} from '../../store/slices/addTokenSlice';

const AddToken: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();

  const contractAddress = useAppSelector((state) => state.addToken.contractAddress);
  const name = useAppSelector((state) => state.addToken.name);
  const symbol = useAppSelector((state) => state.addToken.symbol);
  const decimals = useAppSelector((state) => state.addToken.decimals);
  const isValidating = useAppSelector((state) => state.addToken.isValidating);
  const contractAddressFieldError = useAppSelector(selectContractAddressFieldError);
  const tokenAlreadyInListError = useAppSelector(selectTokenAlreadyInListError);
  const buttonDisabled = useAppSelector(selectAddTokenButtonDisabled);

  useEffect(() => {
    dispatch(resetAddToken());
  }, [dispatch]);

  const onEnterPress = (event: any) => {
    handleEnterPress(event, () => {
      if (!buttonDisabled) {
        dispatch(addToken());
      }
    });
  };

  return (
    <PageLayout hasBackButton title="Add Token">
      <Stack spacing={2}>
        {/* Contract Address Field */}
        <div>
          <Typography variant="subtitle2" gutterBottom>Contract Address</Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              type="text"
              multiline={false}
              value={contractAddress || ''}
              onChange={(event) => dispatch(validateContractAddress(event.target.value))}
              onKeyPress={onEnterPress}
            />
            {isValidating && (
              <CircularProgress
                size={20}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}
          </Box>
          {contractAddress && contractAddressFieldError && !isValidating && (
            <Typography className={classes.errorText}>{contractAddressFieldError}</Typography>
          )}
        </div>

        {/* Token Details */}
        {name && (
          <Stack spacing={1}>
            <DetailField fieldName="Token Name" value={name} classes={classes} />
            <DetailField fieldName="Token Symbol" value={symbol} classes={classes} />
            <DetailField fieldName="Decimals" value={decimals} classes={classes} />
          </Stack>
        )}
      </Stack>

      {!!tokenAlreadyInListError && (
        <Typography className={classes.errorText} sx={{ mt: 1 }}>{tokenAlreadyInListError}</Typography>
      )}

      <Button
        className={classes.addButton}
        fullWidth
        variant="contained"
        color="primary"
        disabled={buttonDisabled || isValidating}
        onClick={() => dispatch(addToken())}
        sx={{ mt: 2 }}
      >
          Add
      </Button>
    </PageLayout>
  );
};

const DetailField: React.FC<{
  classes: Record<string, string>;
  fieldName: string;
  value: string | number | undefined;
}> = ({ classes: _classes, fieldName, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="caption" color="text.secondary">{fieldName}</Typography>
    <Typography variant="body2" fontWeight="bold">{value || ''}</Typography>
  </Box>
);

export default AddToken;
