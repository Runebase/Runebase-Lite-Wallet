import React from 'react';
import { Typography, Card, CardContent, CardActions, Button } from '@mui/material';
import { RunebaseInfo } from 'runebasejs-wallet';

interface SuperStaker {
  address: string;
  note?: string;
  cycles?: number;
  totalBlocksProduced?: number;
  score?: number;
  firstRegisteredOn?: string;
  lastProducedBlock?: string;
}

interface SuperStakerCardProps {
  superstaker: SuperStaker;
  delegationInfo: RunebaseInfo.IGetAddressDelegation | undefined;
}

const SuperStakerCard: React.FC<SuperStakerCardProps> = ({
  superstaker,
  delegationInfo,
}) => {
  const addDelegation = async (
    superStakerAddress: string,
    fee: number = 10,
  ) => {
    console.log('removeDelegation: ', superStakerAddress);
    console.log('fee: ', fee);
    console.log(delegationInfo);
  };

  const removeDelegation = async () => {
    console.log('removeDelegation');
  };

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {superstaker.address}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          cycles:
          {' '}
          {superstaker.cycles}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          firstRegisteredOn:
          {' '}
          {superstaker.firstRegisteredOn}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          lastProducedBlock:
          {' '}
          {superstaker.lastProducedBlock}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          totalBlocksProduced:
          {' '}
          {superstaker.totalBlocksProduced}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          score:
          {' '}
          {superstaker.score}
        </Typography>
        <Typography variant="body2">
          {superstaker.note}
        </Typography>
      </CardContent>
      <CardActions>
        {
          delegationInfo
          && delegationInfo.staker === superstaker.address
            ? (
              <Button
                variant="contained"
                onClick={() => {
                  removeDelegation();
                }}
              >
                Undelegate
              </Button>
            )
            : delegationInfo && delegationInfo.staker !== ''
              ?(
                <Button
                  variant="contained"
                  onClick={() => {
                    addDelegation(superstaker.address);
                  }}
                >
                  Change Delegate
                </Button>
              )
              : (
                <Button
                  variant="contained"
                  onClick={() => {
                    addDelegation(superstaker.address);
                  }}
                >
                  Delegate
                </Button>
              )
        }
        <Button
          variant="contained"
          onClick={() => {
            addDelegation(superstaker.address);
          }}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default SuperStakerCard;
