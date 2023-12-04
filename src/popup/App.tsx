import React from 'react';
import { Provider as MobxProvider, observer } from 'mobx-react';
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  createTheme
} from '@mui/material/styles';
import MainContainer from './MainContainer';
import { store } from './stores/AppStore';
import { MemoryRouter } from 'react-router-dom';
declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

const theme = createTheme();

interface IProps {
  port: chrome.runtime.Port;
}
const App: React.FC<IProps> = observer(() => {
  return (
    <MobxProvider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login']}>
            <MainContainer store={store} />
          </MemoryRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    </MobxProvider>
  );
});

export default App;
