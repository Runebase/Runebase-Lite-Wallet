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
import { useTheme } from '@mui/material/styles';
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

const ElectrumXStatusBar: React.FC = () => {
  const theme = useTheme();
  const electrumxStatus = useAppSelector(selectElectrumXStatus);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const CONNECTION_COLORS: Record<string, string> = {
    connected: theme.palette.success.main,
    connecting: theme.palette.warning.main,
    reconnecting: theme.palette.warning.main,
    disconnected: theme.palette.error.main,
  };

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

  const dotColor = CONNECTION_COLORS[electrumxStatus.state] || theme.palette.text.secondary;
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
          <Typography variant="caption" color="text.secondary">
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
