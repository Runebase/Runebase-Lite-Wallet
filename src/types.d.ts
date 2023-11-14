// import { utils } from 'ethers';
import { Insight } from 'runebasejs-wallet';
import { ISendTxOptions } from 'runebasejs-wallet/lib/tx';
import {
  API_TYPE,
  TARGET_NAME,
  // INTERNAL_API_TYPE,
  RUNEBASECHROME_ACCOUNT_CHANGE
} from './constants';
import {
  // Transaction,
  InpageAccount
} from './models';

export interface IExtensionMessageData<T> {
  target: TARGET_NAME;
  message: T;
}

export interface IExtensionAPIMessage<T> {
  type: API_TYPE;
  payload: T;
}

export interface IRPCCallPendingRequest {
  resolve: (result?: any) => void;
  reject: (reason?: any) => void;
}
export interface PodSignRequest {
  id: string;
  superStakerAddress: string;
}
export interface PodSignPendingRequest {
  resolve: (result?: any) => void;
  reject: (reason?: any) => void;
}
export interface PodSignResponse {
  id: string;
  result?: PodSignResult;
  error?: string;
}
export interface PodSignResult {
  superStakerAddress: string;
  delegatorAddress: string;
  podMessage: string;
}

export interface IRPCCallRequest {
  id: string;
  method: string;
  args: any[];
  account?: ICurrentAccount;
}

export interface IRPCCallResponse {
  id: string;
  result?: Insight.IContractCall | Insight.ISendRawTxResult;
  error?: string;
}

export interface ICurrentAccount {
  name: string;
  address: string;
}

export interface ISignExternalTxRequest {
  url: string;
  request: IRPCCallRequest;
}

export interface ISigner {
  send(to: string, amount: number, options: ISendTxOptions): Promise<Insight.ISendRawTxResult>;
  sendTransaction(args: any[]): any;
}

export interface IInpageAccountWrapper {
  account: InpageAccount;
  error: Error;
  statusChangeReason: RUNEBASECHROME_ACCOUNT_CHANGE;
}

// mui.d.ts
import '@material-ui/core/styles';

declare module '@material-ui/core/styles' {
  interface Theme {
    font?: {
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      // Add other font sizes if needed
    };
    border: {
      root: string;
      radius: string;
    };
    radius: {
      root: string;
    };
    typography: {
      fontSizeSmall: string;
      fontSizeMedium: string;
      fontSizeLarge: string;
      lineHeightSmall?: string; // Add this line
      lineHeightMedium?: string; // Add this line
      lineHeightLarge?: string; // Add this line
      // Add other typography properties if needed
    };
    palette: {
      gradientPurple?: string; // Add this line
      orange?: string; // Add this line
      gray?: string; // Add this line
      // Add other palette properties if needed
    };
    overrides?: {
      MuiTab?: {
        root?: {
          padding?: number;
        };
        label?: {
          fontFamily?: string;
          fontSize?: string;
          fontWeight?: FontWeightProperty; // Add this line
        };
      };
      // Add other overrides if needed
    };
    components?: {
      AccountInfo?: {
        styles?: {
          fontWeight?: FontWeightProperty; // Add this line
        };
      };
      PasswordInput?: {
        styles?: {
          fontSizeSmall?: string; // Add this line
        };
      };
      Loading?: {
        styles?: {
          fontSizeMedium?: string; // Add this line
        };
      };
      NavBar?: {
        styles?: {
          fontSizeLarge?: string; // Add this line
          fontWeight?: FontWeightProperty; // Add this line
        };
      };
      // Add other component styles if needed
    };
  }
}

// mui.d.ts
import '@material-ui/core/styles/createTypography';

declare module '@material-ui/core/styles/createTypography' {
  interface Typography {
    fontSizeMedium?: React.CSSProperties['fontSize'];
    fontSizeSmall?: React.CSSProperties['fontSize'];
    fontSizeLarge?: React.CSSProperties['fontSize'];
    fontSizeExtraSmall?: React.CSSProperties['fontSize'];
    lineHeight?: React.CSSProperties['lineHeight'];
    lineHeightSmall?: React.CSSProperties['lineHeight'];
    lineHeightMedium?: React.CSSProperties['lineHeight'];
    lineHeightLarge?: React.CSSProperties['lineHeight'];
    fontWeight?: React.CSSProperties['fontWeight'];
    // Add other properties as needed
  }
}


declare module '@material-ui/core/styles/createPalette' {
  interface Palette {
    gradientPurple: {
      main: string,
    },
    gray: {
      main: string,
    },
    orange: {
      main: string,
    },
    // Add other custom color properties
  }
}

// mui.d.ts
import '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface ThemeOptions {
    color: {
      gray: string;
      orange: string;
      red: string;
      gradientPurple: string;
    };
    padding?: {
      halfUnit: string;
      unit: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      custom: (multiplier: number) => string;
    };
    font?: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight?: {
      bold: string;
    };
    lineHeight?: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    border?: {
      root: string;
      radius: string;
    };
    icon?: {
      size: string;
    };
    button?: {
      sm: {
        height: string;
        radius: string;
      };
      lg: {
        height: string;
        radius: string;
      };
    };
  }
}
