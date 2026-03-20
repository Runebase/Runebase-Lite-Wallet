import React, { useEffect } from 'react';
import { Typography, Select, MenuItem } from '@mui/material';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  initSettings,
  changeSessionLogoutInterval,
  SESSION_LOGOUT_INTERVALS,
} from '../../store/slices/settingsSlice';

const Settings: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const sessionLogoutInterval = useAppSelector((state) => state.settings.sessionLogoutInterval);

  useEffect(() => {
    dispatch(initSettings());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <NavBar hasBackButton title="Settings" />
      <div className={classes.contentContainer}>
        <div className={classes.fieldsContainer}>
          <SliField classes={classes} />
        </div>
      </div>
    </div>
  );
};

const SliField: React.FC<{ classes: Record<string, string> }> = ({ classes }) => {
  const dispatch = useAppDispatch();
  const sessionLogoutInterval = useAppSelector((state) => state.settings.sessionLogoutInterval);

  return (
    <div className={classes.fieldContainer}>
      <Heading name="Session Logout Interval" classes={classes} />
      <div className={classes.fieldContentContainer}>
        <Select
          className={classes.select}
          inputProps={{ name: 'sessionLogoutInterval', id: 'sessionLogoutInterval' }}
          value={sessionLogoutInterval}
          onChange={(event) => dispatch(changeSessionLogoutInterval(Number(event.target.value)))}
        >
          {SESSION_LOGOUT_INTERVALS.map((sli) => (
            <MenuItem key={sli.interval} value={sli.interval}>
              <Typography className={classes.selectTypography}>{sli.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

interface HeadingProps {
  classes: Record<string, string>;
  name: string;
}

const Heading: React.FC<HeadingProps> = ({ name }) => {
  const { classes } = useStyles();
  return (
    <Typography className={classes.fieldHeading}>{name}</Typography>
  );
};

export default Settings;
