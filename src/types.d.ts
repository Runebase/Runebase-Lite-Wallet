import {
  API_TYPE,
  TARGET_NAME,
  RUNEBASECHROME_ACCOUNT_CHANGE
} from './constants';
import {
  InpageAccount
} from './models';
import { ISendRawTxResult, IContractCall } from './services/wallet/types';
import { ElectrumXManager } from './services/electrumx';

export interface PodReturnResult {
  podMessage: string;
  superStakerAddress: string;
  delegatorAddress: string;
}

export interface SuperStaker {
  address: string;
  lastProducedBlock: string;
  score: number;
  cycles: number;
  firstRegisteredOn: string;
  totalBlocksProduced: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    user_id: string;
    exp: number;
    banned: boolean;
  };
}

export type SuperStakerArray = SuperStaker[];

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
  result?: IContractCall | ISendRawTxResult;
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
  send(
    to: string, amount: number, options: { feeRate: number }, electrumx: ElectrumXManager
  ): Promise<ISendRawTxResult>;
  sendTransaction(args: any[], electrumx: ElectrumXManager, feeRate?: number): Promise<ISendRawTxResult>;
}

export interface IInpageAccountWrapper {
  account: InpageAccount;
  error: Error;
  statusChangeReason: RUNEBASECHROME_ACCOUNT_CHANGE;
}

/* MUI v7 theme augmentation for custom properties */
declare module '@mui/material/styles' {
  interface Theme {
    color: {
      gray: string;
      orange: string;
      red: string;
      gradientPurple: string;
    };
    padding: {
      halfUnit: string;
      unit: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      custom: (multiplier: number) => string;
    };
    font: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      bold: string;
    };
    lineHeight: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    border: {
      root: string;
      radius: string;
    };
    icon: {
      size: string;
    };
    button: {
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
  interface ThemeOptions {
    color?: Theme['color'];
    padding?: Theme['padding'];
    font?: Theme['font'];
    fontWeight?: Theme['fontWeight'];
    lineHeight?: Theme['lineHeight'];
    border?: Theme['border'];
    icon?: Theme['icon'];
    button?: Theme['button'];
  }

  interface TypographyVariants {
    fontSizeMedium?: React.CSSProperties['fontSize'];
    fontSizeSmall?: React.CSSProperties['fontSize'];
    fontSizeLarge?: React.CSSProperties['fontSize'];
    fontSizeExtraSmall?: React.CSSProperties['fontSize'];
  }
  interface TypographyVariantsOptions {
    fontSizeMedium?: React.CSSProperties['fontSize'];
    fontSizeSmall?: React.CSSProperties['fontSize'];
    fontSizeLarge?: React.CSSProperties['fontSize'];
    fontSizeExtraSmall?: React.CSSProperties['fontSize'];
  }
}
