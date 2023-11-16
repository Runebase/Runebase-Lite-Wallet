import React from 'react';
import NavBar from '../../components/NavBar';
import MainAccount from './MainAccount';
import useStyles from './styles';

interface IProps {
  classes: Record<string, string>;
}

const Home: React.FC<IProps> = () => {
    const classes = useStyles();
    return (
    <div className={classes.root}>
      <NavBar hasSettingsButton hasNetworkSelector title="Home" />
      <div className={classes.content}>
        <MainAccount />
      </div>
    </div>
  );
};

export default Home;
