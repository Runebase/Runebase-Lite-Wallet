import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Typography, Select, MenuItem } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { map } from 'lodash';

import styles from './styles';
import NavBar from '../../components/NavBar';
import AppStore from '../../stores/AppStore';
import { SessionLogoutInterval } from '../../../models/SessionLogoutInterval';

interface IProps {
  classes: Record<string, string>;
  store: AppStore;
}

@inject('store')
@observer
class Settings extends Component<WithStyles<typeof styles> & IProps, NonNullable<unknown>> {
  public render() {
    const { classes } = this.props;

    return(
      <div className={classes.root}>
        <NavBar hasBackButton title="Settings" />
        <div className={classes.contentContainer}>
          <div className={classes.fieldsContainer}>
            <SliField {...this.props} />
          </div>
        </div>
      </div>
    );
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const SliField: React.FC<any> = observer(({ classes, store: { settingsStore } }: any) => (
  <div className={classes.fieldContainer}>
    <Heading name="Session Logout Interval" />
    <div className={classes.fieldContentContainer}>
      <Select
        className={classes.select}
        inputProps={{ name: 'sessionLogoutInterval', id: 'sessionLogoutInterval'}}
        disableUnderline
        value={settingsStore.sessionLogoutInterval}
        onChange={(event) => settingsStore.changeSessionLogoutInterval(event.target.value)}
      >
      {map(settingsStore.sliArray, (sli: SessionLogoutInterval) =>
        <MenuItem key={sli.interval} value={sli.interval}>
          <Typography className={classes.selectTypography}>{sli.name}</Typography>
        </MenuItem>,
      )}
      </Select>
    </div>
  </div>
));

// eslint-disable-next-line @typescript-eslint/naming-convention
const Heading = withStyles(styles, { withTheme: true })(({ classes, name }: any) => (
  <Typography className={classes.fieldHeading}>{name}</Typography>
));

export default withStyles(styles)(Settings);
