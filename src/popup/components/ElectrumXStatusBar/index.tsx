import React, { useState } from 'react';
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  FiberManualRecord,
  Check,
  Autorenew,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import {
  selectElectrumXStatus,
  switchElectrumXServer,
} from '../../store/slices/sessionSlice';

const CONNECTION_COLORS: Record<string, string> = {
  connected: '#4caf50',
  connecting: '#ff9800',
  reconnecting: '#ff9800',
  disconnected: '#f44336',
};

const ElectrumXStatusBar: React.FC = () => {
  const electrumxStatus = useAppSelector(selectElectrumXStatus);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchor(null);
  };

  const handleServerSelect = (index: number) => {
    switchElectrumXServer(index);
    handleClose();
  };

  const dotColor = CONNECTION_COLORS[electrumxStatus.state] || '#9e9e9e';
  const label = electrumxStatus.state === 'connected'
    ? electrumxStatus.serverLabel
    : electrumxStatus.state.charAt(0).toUpperCase() + electrumxStatus.state.slice(1);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 0.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Chip
          icon={<FiberManualRecord style={{ color: dotColor, fontSize: 10 }} />}
          label={label || 'No server'}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 22, cursor: 'pointer' }}
        />
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MenuItem disabled dense>
          <Typography variant="caption" color="textSecondary">
            Select ElectrumX Server
          </Typography>
        </MenuItem>
        {electrumxStatus.servers.map((server, index) => {
          const isActive = index === electrumxStatus.serverIndex;
          const serverLabel = server.label || `${server.host}:${server.port}`;
          return (
            <MenuItem
              key={index}
              onClick={() => handleServerSelect(index)}
              selected={isActive}
              dense
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {isActive
                  ? <Check fontSize="small" color="success" />
                  : <Autorenew fontSize="small" sx={{ opacity: 0.3 }} />
                }
              </ListItemIcon>
              <ListItemText
                primary={serverLabel}
                primaryTypographyProps={{ fontSize: '0.8rem' }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ElectrumXStatusBar;
