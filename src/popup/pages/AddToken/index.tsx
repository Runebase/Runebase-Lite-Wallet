import React, { useEffect } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import { inject, observer } from 'mobx-react';
import cx from 'classnames';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import { handleEnterPress } from '../../../utils';
import useStyles from './styles';

interface IProps {
  store: AppStore;
}

const AddToken: React.FC<IProps> = ({ store }) => {
  const classes = useStyles();
  const { addTokenStore } = store;
  useEffect(() => { store.addTokenStore.init(); }, [addTokenStore]);
  useEffect(() => { }, [addTokenStore.contractAddress]);

  const onEnterPress = (event: any) => {
    handleEnterPress(event, () => {
      if (!store.addTokenStore.buttonDisabled) {
        store.addTokenStore.addToken();
      }
    });
  };

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Add Token" />
      <div className={classes.contentContainer}>
        <div className={classes.fieldsContainer}>
          <ContractAddressField onEnterPress={onEnterPress} {...{ classes, store }} />
          {store.addTokenStore.name && (
            <div>
              <DetailField fieldName={'Token Name'} value={store.addTokenStore.name} {...{ classes }} />
              <DetailField fieldName={'Token Symbol'} value={store.addTokenStore.symbol} {...{ classes }} />
              <DetailField fieldName={'Decimals'} value={store.addTokenStore.decimals} {...{ classes }} />
            </div>
          )}
        </div>
        {!!store.addTokenStore.tokenAlreadyInListError && (
          <Typography className={classes.errorText}>{store.addTokenStore.tokenAlreadyInListError}</Typography>
        )}
        <AddButton {...{ classes, store }} />
      </div>
    </div>
  );
};

const Heading: React.FC<{
  classes: Record<string, string>;
  name: string
}> = ({
  classes,
  name
}) => (
  <Typography className={classes.fieldHeading}>{name}</Typography>
);

const ContractAddressField: React.FC<{
  classes: Record<string, string>;
  store: { addTokenStore: any };
  onEnterPress: (event: any) => void
}> = ({
  classes,
  store: { addTokenStore },
  onEnterPress,
}) => (
  <div className={classes.fieldContainer}>
    <Heading name="Contract Address" classes={classes} />
    <div className={classes.fieldContentContainer}>
      <TextField
        fullWidth
        type="text"
        multiline={false}
        value={addTokenStore.contractAddress || ''}
        onChange={(event) => addTokenStore.setContractAddress(event.target.value)}
        onKeyPress={onEnterPress}
      />
    </div>
    {addTokenStore.contractAddressFieldError && (
      <Typography className={classes.errorText}>{addTokenStore.contractAddressFieldError}</Typography>
    )}
  </div>
);


const DetailField: React.FC<{
  classes: Record<string, string>;
  fieldName: string;
  value: string | number | undefined
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
  store: {
    addTokenStore: any
  }
}> = ({
  classes,
  store
}) => (
  <Button
    className={classes.addButton}
    fullWidth
    variant="contained"
    color="primary"
    disabled={store.addTokenStore.buttonDisabled}
    onClick={store.addTokenStore.addToken}
  >
    Add
  </Button>
);

export default inject('store')(observer(AddToken));
