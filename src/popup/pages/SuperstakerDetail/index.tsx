import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import { Button, Card, CardActions, CardContent, Tooltip, Typography, Divider } from '@mui/material';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import moment from 'moment';
interface IProps {
  store: AppStore;
}

const SuperstakerDetail: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();
    const { sessionStore, delegateStore } = store;
    const { loggedInAccountName, walletInfo, delegationInfo } = sessionStore;
    const { selectedSuperstakerDelegations, selectedSuperstaker } = delegateStore;
    if (!loggedInAccountName || !walletInfo) return null;

    useEffect(() => {
      delegateStore.getSelectedSuperstakerDelegations();
    }, []);
    useEffect(() => { }, [
      selectedSuperstakerDelegations,
      selectedSuperstaker,
    ]);


    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Super Staker Detail" />
        <Card sx={{ margin: '10px', minWidth: 275, backgroundColor: '#f7f7f7', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Tooltip title="SuperStaker Wallet Address">
              <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }} gutterBottom>
                {selectedSuperstaker?.address}
              </Typography>
            </Tooltip>
            <Tooltip title="SuperStaker Registration Date">
              <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
                <AppRegistrationIcon sx={{ color: '#2196f3', marginRight: 0.5 }} />{' '}
                {moment(selectedSuperstaker?.firstRegisteredOn).format('YYYY-MM-DD HH:mm:ss')}
              </Typography>
            </Tooltip>
            <Tooltip title="Total Blocks Produced Since Registration">
              <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
                <DynamicFormIcon sx={{ color: '#4caf50', marginRight: 0.5 }} /> {selectedSuperstaker?.totalBlocksProduced}
              </Typography>
            </Tooltip>
            <Tooltip title="Last Block Produced Date">
              <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
                <NotificationAddIcon sx={{ color: '#ff9800', marginRight: 0.5 }} />{' '}
                {moment(selectedSuperstaker?.lastProducedBlock).format('YYYY-MM-DD HH:mm:ss')}
              </Typography>
            </Tooltip>
            <Typography sx={{ mb: 0.5, display: 'flex', alignItems: 'center', color: '#555555' }}>
              <Tooltip title="SuperStaker Score">
                <>
                  <SportsScoreIcon sx={{ color: '#e91e63', marginRight: 0.5 }} />
                  {selectedSuperstaker?.score}
                </>
              </Tooltip>
              /
              <Tooltip title="Cycles Participated">
                <>{selectedSuperstaker?.cycles}</>
              </Tooltip>
            </Typography>
            <Tooltip title="Personal Note from the SuperStaker">
              <Typography variant="body2" sx={{ color: '#777777' }}>
                {selectedSuperstaker?.note}
              </Typography>
            </Tooltip>
            <CardActions sx={{ margin: '0px', paddingLeft: '0px', paddingRight: '0px' }}>
              {delegationInfo && delegationInfo.staker === selectedSuperstaker?.address ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    store.navigate?.('/remove-delegation');
                  }}
                >
                Undelegate
                </Button>
              ) : delegationInfo && delegationInfo.staker !== '' ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    store.navigate?.('/add-delegation');
                  }}
                >
                Change Delegate
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    store.navigate?.('/add-delegation');
                  }}
                >
                Delegate
                </Button>
              )}
            </CardActions>
            <Divider sx={{ margin: '10px 0' }} />
            {selectedSuperstakerDelegations?.map((delegation, index) => (
              <div key={index}>
                <Tooltip title={`Delegate ${index + 1} Details`}>
                  <Typography variant="subtitle1" sx={{ mb: 0.5, color: '#333333' }}>
                    Delegation <strong>#{index + 1}</strong>
                  </Typography>
                </Tooltip>
                <Tooltip title={`Delegate ${index + 1} Wallet Address`}>
                  <Typography sx={{ fontSize: 12, mb: 0.5, color: '#555555', wordWrap: 'break-word' }}>
                    Delegate: <strong>{delegation.delegate}</strong>
                  </Typography>
                </Tooltip>
                <Tooltip title={`Staker ${index + 1} Wallet Address`}>
                  <Typography sx={{ fontSize: 12, mb: 0.5, color: '#555555', wordWrap: 'break-word' }}>
                    Staker: <strong></strong>{delegation.staker}
                  </Typography>
                </Tooltip>
                <Tooltip title={`Fee for Delegate ${index + 1}`}>
                  <Typography sx={{ fontSize: 12, mb: 0.5, color: '#555555' }}>
                    Fee: <strong>{delegation.fee}%</strong>
                  </Typography>
                </Tooltip>
                <Tooltip title={`Block Height for Delegate ${index + 1}`}>
                  <Typography sx={{ fontSize: 12, mb: 0.5, color: '#555555' }}>
                    Block Height: <strong>{delegation.blockHeight}</strong>
                  </Typography>
                </Tooltip>
                <Tooltip title={`Proof of Delegation for Delegate ${index + 1}`}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      mb: 0.5,
                      color: '#555555',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    PoD: <strong>{delegation.PoD}</strong>
                  </Typography>
                </Tooltip>
                <Divider sx={{ margin: '10px 0' }} />
              </div>
            ))}
          </CardContent>

        </Card>
      </div>
    );
  })
);

export default SuperstakerDetail;
