import React, { useEffect } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import cx from 'classnames';

import NavBar from '../../components/NavBar';
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
    <div className={classes.root}>
      <NavBar hasBackButton title="Add Token" />
      <div className={classes.contentContainer}>
        <div className={classes.fieldsContainer}>
          <ContractAddressField onEnterPress={onEnterPress} classes={classes} />
          {name && (
            <div>
              <DetailField fieldName={'Token Name'} value={name} classes={classes} />
              <DetailField fieldName={'Token Symbol'} value={symbol} classes={classes} />
              <DetailField fieldName={'Decimals'} value={decimals} classes={classes} />
            </div>
          )}
        </div>
        {!!tokenAlreadyInListError && (
          <Typography className={classes.errorText}>{tokenAlreadyInListError}</Typography>
        )}
        <AddButton classes={classes} />
      </div>
    </div>
  );
};

const Heading: React.FC<{
  classes: Record<string, string>;
  name: string;
}> = ({
  classes,
  name
}) => (
  <Typography className={classes.fieldHeading}>{name}</Typography>
);

const ContractAddressField: React.FC<{
  classes: Record<string, string>;
  onEnterPress: (event: any) => void;
}> = ({
  classes,
  onEnterPress,
}) => {
  const dispatch = useAppDispatch();
  const contractAddress = useAppSelector((state) => state.addToken.contractAddress);
  const contractAddressFieldError = useAppSelector(selectContractAddressFieldError);

  return (
    <div className={classes.fieldContainer}>
      <Heading name="Contract Address" classes={classes} />
      <div className={classes.fieldContentContainer}>
        <TextField
          fullWidth
          type="text"
          multiline={false}
          value={contractAddress || ''}
          onChange={(event) => dispatch(validateContractAddress(event.target.value))}
          onKeyPress={onEnterPress}
        />
      </div>
      {contractAddressFieldError && (
        <Typography className={classes.errorText}>{contractAddressFieldError}</Typography>
      )}
    </div>
  );
};

const DetailField: React.FC<{
  classes: Record<string, string>;
  fieldName: string;
  value: string | number | undefined;
}> = ({
  classes,
  fieldName,
  value
}) => (
  <div className={cx(classes.detailContainer)}>
    <div className={classes.labelContainer}>
      <Typography className={cx(classes.detailLabel)}>{fieldName}</Typography>
    </div>
    <div className={classes.valueContainer}>
      <Typography className={classes.detailValue}>{value || ''}</Typography>
    </div>
  </div>
);

const AddButton: React.FC<{
  classes: Record<string, string>;
}> = ({
  classes,
}) => {
  const dispatch = useAppDispatch();
  const buttonDisabled = useAppSelector(selectAddTokenButtonDisabled);

  return (
    <Button
      className={classes.addButton}
      fullWidth
      variant="contained"
      color="primary"
      disabled={buttonDisabled}
      onClick={() => dispatch(addToken())}
    >
      Add
    </Button>
  );
};

export default AddToken;
