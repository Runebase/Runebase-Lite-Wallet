import React from 'react';
import { Typography, Card, CardContent, CardActions, Button, Tooltip } from '@mui/material';
import { RunebaseInfo } from 'runebasejs-wallet';
import { RouterStore } from 'mobx-react-router';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import moment from 'moment';
import DelegateStore from '../../stores/DelegateStore';
import { SuperStaker } from '../../../types';

interface SuperStakerCardProps {
  superstaker: SuperStaker;
  delegationInfo: RunebaseInfo.IGetAddressDelegation | undefined;
  routerStore: RouterStore;
  delegateStore: DelegateStore;
}

const SuperStakerCard: React.FC<SuperStakerCardProps> = ({
  superstaker,
  delegationInfo,
  routerStore,
  delegateStore,
}) => {
  return (
    <Card sx={{ minWidth: 275, maxWidth: 350, backgroundColor: '#f7f7f7', border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Tooltip title="SuperStaker Wallet Address">
          <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }} gutterBottom>
            {superstaker.address}
          </Typography>
        </Tooltip>
        <Tooltip title="SuperStaker Registration Date">
          <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
            <AppRegistrationIcon sx={{ color: '#2196f3', marginRight: 0.5 }} />{' '}
            {moment(superstaker.firstRegisteredOn).format('YYYY-MM-DD HH:mm:ss')}
          </Typography>
        </Tooltip>
        <Tooltip title="Total Blocks Produced Since Registration">
          <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
            <DynamicFormIcon sx={{ color: '#4caf50', marginRight: 0.5 }} /> {superstaker.totalBlocksProduced}
          </Typography>
        </Tooltip>
        <Tooltip title="Last Block Produced Date">
          <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
            <NotificationAddIcon sx={{ color: '#ff9800', marginRight: 0.5 }} />{' '}
            {moment(superstaker.lastProducedBlock).format('YYYY-MM-DD HH:mm:ss')}
          </Typography>
        </Tooltip>
        <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
          <Tooltip title="SuperStaker Score">
            <>
              <SportsScoreIcon sx={{ color: '#e91e63', marginRight: 0.5 }} />
              {superstaker.score}
            </>
          </Tooltip>
          /
          <Tooltip title="Cycles Participated">
            <>{superstaker.cycles}</>
          </Tooltip>
        </Typography>
        <Tooltip title="Personal Note from the SuperStaker">
          <Typography variant="body2" sx={{ color: '#777777' }}>
            {superstaker.note}
          </Typography>
        </Tooltip>
      </CardContent>
      <CardActions>
        {delegationInfo && delegationInfo.staker === superstaker.address ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              routerStore.push('/undelegate-confirm');
            }}
          >
            Undelegate
          </Button>
        ) : delegationInfo && delegationInfo.staker !== '' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              routerStore.push('/delegate-confirm');
            }}
          >
            Change Delegate
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              routerStore.push('/delegate-confirm');
            }}
          >
            Delegate
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            delegateStore.setSelectedSuperStaker(superstaker);
            routerStore.push('/superstaker-detail');
          }}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default SuperStakerCard;
