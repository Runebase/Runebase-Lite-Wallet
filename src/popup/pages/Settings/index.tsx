import React from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Select, MenuItem } from '@mui/material';
import { map } from 'lodash';

import useStyles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import { SessionLogoutInterval } from '../../../models/SessionLogoutInterval';

interface IProps {
  store: AppStore;
}

const Settings: React.FC<IProps> = inject('store')(
  observer(({ store }) => {
    const classes = useStyles();

    return (
      <div className={classes.root}>
        <NavBar hasBackButton title="Settings" />
        <div className={classes.contentContainer}>
          <div className={classes.fieldsContainer}>
            <SliField classes={classes} store={store} />
          </div>
        </div>
      </div>
    );
  })
);

interface SliFieldProps {
  classes: Record<string, string>;
  store: { settingsStore: { sessionLogoutInterval: number;
    changeSessionLogoutInterval: (value: number) => void; sliArray: SessionLogoutInterval[] } };
}

const SliField: React.FC<SliFieldProps> = observer(({ classes, store }) => (
  <div className={classes.fieldContainer}>
    <Heading name="Session Logout Interval" classes={classes} />
    <div className={classes.fieldContentContainer}>
      <Select
        className={classes.select}
        inputProps={{ name: 'sessionLogoutInterval', id: 'sessionLogoutInterval'}}
        value={store.settingsStore.sessionLogoutInterval}
        onChange={(event) => store.settingsStore.changeSessionLogoutInterval(Number(event.target.value))}
      >
        {map(store.settingsStore.sliArray, (sli: SessionLogoutInterval) => (
          <MenuItem key={sli.interval} value={sli.interval}>
            <Typography className={classes.selectTypography}>{sli.name}</Typography>
          </MenuItem>
        ))}
      </Select>
    </div>
  </div>
));

interface HeadingProps {
  classes: Record<string, string>;
  name: string;
}

const Heading: React.FC<HeadingProps> = ({ name }) => {
  const classes = useStyles();
  return (
    <Typography className={classes.fieldHeading}>{name}</Typography>
  );
};

export default Settings;
