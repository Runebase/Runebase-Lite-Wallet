import React from 'react';
import { Provider as MobxProvider, observer } from 'mobx-react';
import { ThemeProvider } from '@mui/material/styles';
import MainContainer from './MainContainer';
import { store } from './stores/AppStore';
import { MemoryRouter } from 'react-router';
import theme from './theme';

interface IProps {
  port: chrome.runtime.Port;
}
const App: React.FC<IProps> = observer(() => {
  return (
    <MobxProvider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/login']}>
          <MainContainer store={store} />
        </MemoryRouter>
      </ThemeProvider>
    </MobxProvider>
  );
});

export default App;
