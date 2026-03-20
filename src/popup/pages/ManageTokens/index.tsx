import React, { useEffect } from 'react';
import { Typography, Button, Divider } from '@mui/material';
import { isUndefined } from 'lodash';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  initAccountDetail,
  deinitAccountDetail,
  removeToken,
  routeToAddToken,
  setEditTokenMode,
} from '../../store/slices/accountDetailSlice';
import RRCToken from '../../../models/RRCToken';

const ManageTokens: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const verifiedTokens = useAppSelector((state) => state.accountDetail.verifiedTokens);
  const editTokenMode = useAppSelector((state) => state.accountDetail.editTokenMode);

  useEffect(() => {
    initAccountDetail();
    return () => {
      deinitAccountDetail();
    };
  }, []);

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Manage Tokens" />
      <div className={classes.contentContainer}>
        <TokenList classes={classes} />
      </div>
    </div>
  );
};

const TokenList: React.FC<{ classes: Record<string, string> }> = ({ classes }) => {
  const dispatch = useAppDispatch();
  const verifiedTokens = useAppSelector((state) => state.accountDetail.verifiedTokens);
  const editTokenMode = useAppSelector((state) => state.accountDetail.editTokenMode);

  return (
    <div>
      {verifiedTokens
      && verifiedTokens.map(({ name, symbol, balance, address }: RRCToken) => (
        <div
          key={symbol}
          onClick={() => editTokenMode && removeToken(address)}
        >
          {editTokenMode && (
            <Button className={classes.tokenDeleteButton} id="removeTokenButton">
              <img src="images/ic_delete.svg" alt="Delete Token" />
            </Button>
          )}
          <div className={classes.tokenInfoContainer}>
            <Typography className={classes.tokenName}>{name}</Typography>
            <AmountInfo
              classes={classes}
              amount={balance}
              token={symbol}
              convertedValue={0}
            />
          </div>
          <div style={{ float: 'left', width: '100%' }}>
            <Typography variant="caption">{address}</Typography>
          </div>
          <Divider variant="fullWidth" style={{ border: '1px solid #e0e0e0' }} />
        </div>
      ))}

      <div className={`${classes.bottomButtonWrap} ${classes.listItem}`}>
        <Button
          className={classes.bottomButton}
          id="editTokenButton"
          color="primary"
          size="small"
          onClick={() => dispatch(setEditTokenMode(!editTokenMode))}
        >
          {editTokenMode ? 'Done' : 'Edit'}
        </Button>
        <Button
          className={classes.bottomButton}
          id="addTokenButton"
          color="primary"
          size="small"
          onClick={() => routeToAddToken()}
        >
          Add Token
        </Button>
      </div>
    </div>
  );
};

const AmountInfo: React.FC<{
  classes: Record<string, string>;
  amount: number | undefined;
  token: string;
  convertedValue?: number;
}> = ({
  classes,
  amount,
  token,
  convertedValue
}) => (
  <div>
    <div className={classes.tokenContainer}>
      <Typography className={classes.tokenAmount}>
        {isUndefined(amount) ? '...' : amount}
      </Typography>
      <div className={classes.tokenTypeContainer}>
        <Typography className={classes.tokenType}>{token}</Typography>
      </div>
    </div>
    {convertedValue !== undefined && (
      <>
      </>
      /*
      <div className={classes.conversionContainer}>
        <Typography className={classes.tokenType}>{`= ${convertedValue} RUNES`}</Typography>
      </div>
      */
    ) }
  </div>
);

export default ManageTokens;
