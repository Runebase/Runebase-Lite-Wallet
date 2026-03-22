import React, { useEffect } from 'react';
import {
  Typography,
  Button,
  Divider,
  Box,
  Stack,
} from '@mui/material';
import { isUndefined } from 'lodash';

import useStyles from './styles';
import PageLayout from '../../components/PageLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  initAccountDetail,
  deinitAccountDetail,
  removeToken,
  routeToAddToken,
  setEditTokenMode,
} from '../../store/slices/accountDetailSlice';
import RRCToken from '../../../models/RRCToken';
import { TOKEN_IMAGES, CREDITS_CONTRACT_ADDRESS } from '../../../constants';
import { getImageUrl } from '../../abstraction';

const ManageTokens: React.FC = () => {
  const { classes } = useStyles();

  useEffect(() => {
    initAccountDetail();
    return () => {
      deinitAccountDetail();
    };
  }, []);

  return (
    <PageLayout hasBackButton title="Manage Tokens">
      <TokenList classes={classes} />
    </PageLayout>
  );
};

const TokenList: React.FC<{ classes: Record<string, string> }> = ({ classes }) => {
  const dispatch = useAppDispatch();
  const verifiedTokens = useAppSelector((state) => state.accountDetail.verifiedTokens);
  const editTokenMode = useAppSelector((state) => state.accountDetail.editTokenMode);

  return (
    <div>
      {verifiedTokens && verifiedTokens.length > 0 ? (
        verifiedTokens.map(({ name, symbol, balance, address }: RRCToken) => {
          const tokenLogoSrc = TOKEN_IMAGES[address];
          const isRemovable = address !== CREDITS_CONTRACT_ADDRESS;
          return (
            <div
              key={symbol}
              onClick={() => editTokenMode && isRemovable && removeToken(address)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 1, gap: 1.5 }}>
                {editTokenMode && isRemovable && (
                  <Button
                    className={classes.tokenDeleteButton}
                    id="removeTokenButton"
                    color="error"
                    size="small"
                    sx={{ minWidth: 0, minHeight: 0, p: 0.5 }}
                  >
                    <img src="images/ic_delete.svg" alt="Delete Token" />
                  </Button>
                )}
                {tokenLogoSrc ? (
                  <Box
                    component="img"
                    src={getImageUrl(tokenLogoSrc)}
                    alt={symbol}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      borderRadius: 0.5,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}
                  >
                    {symbol?.[0]}
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isUndefined(balance) ? '...' : balance} {symbol}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 1, display: 'block' }}>
                {address}
              </Typography>
              <Divider />
            </div>
          );
        })
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            No custom tokens added yet
          </Typography>
        </Box>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ p: 1.5 }}>
        <Button
          id="editTokenButton"
          color="primary"
          size="small"
          onClick={() => dispatch(setEditTokenMode(!editTokenMode))}
        >
          {editTokenMode ? 'Done' : 'Edit'}
        </Button>
        <Button
          id="addTokenButton"
          color="primary"
          size="small"
          onClick={() => routeToAddToken()}
        >
          Add Token
        </Button>
      </Stack>
    </div>
  );
};

export default ManageTokens;
