import { observable, computed, action, makeObservable } from 'mobx';
import { find } from 'lodash';

import AppStore from './AppStore';
import { SEND_STATE, MESSAGE_TYPE, TRANSACTION_SPEED } from '../../constants';
import { isValidAddress, isValidAmount, isValidGasLimit, isValidGasPrice } from '../../utils';
import RRCToken from '../../models/RRCToken';
import Config from '../../config';
import BigNumber from 'bignumber.js';
import { addMessageListener, isExtensionEnvironment, sendMessage } from '../abstraction';

const INIT_VALUES = {
  verifiedTokens: [],
  tokens: [],
  senderAddress: undefined,
  receiverAddress: '',
  token: undefined,
  amount: '',
  maxAmount: undefined,
  maxRunebaseSend: undefined,
  sendState: SEND_STATE.INITIAL,
  errorMessage: undefined,
  transactionSpeed: TRANSACTION_SPEED.NORMAL,
  transactionSpeeds: [TRANSACTION_SPEED.SLOW, TRANSACTION_SPEED.NORMAL, TRANSACTION_SPEED.FAST],
  gasLimit: Config.TRANSACTION.DEFAULT_GAS_LIMIT,
  gasPrice: Config.TRANSACTION.DEFAULT_GAS_PRICE,
  gasLimitRecommendedAmount: Config.TRANSACTION.DEFAULT_GAS_LIMIT,
  gasPriceRecommendedAmount: Config.TRANSACTION.DEFAULT_GAS_PRICE, // satoshi/gas
};

export default class SendStore {
  @observable public tokens: RRCToken[] = INIT_VALUES.tokens;
  @observable public verifiedTokens: RRCToken[] = INIT_VALUES.verifiedTokens;
  @observable public senderAddress?: string = INIT_VALUES.senderAddress;
  @observable public receiverAddress?: string = INIT_VALUES.receiverAddress;
  @observable public token?: RRCToken = INIT_VALUES.token;
  @observable public amount: number | string = INIT_VALUES.amount;
  @observable public maxRunebaseSend?: number = INIT_VALUES.maxRunebaseSend;
  public transactionSpeeds: string[] = INIT_VALUES.transactionSpeeds;
  @observable public transactionSpeed?: string = INIT_VALUES.transactionSpeed;
  @observable public gasLimit: number = INIT_VALUES.gasLimitRecommendedAmount;
  @observable public gasPrice: number = INIT_VALUES.gasPriceRecommendedAmount;
  public gasLimitRecommendedAmount: number = INIT_VALUES.gasLimitRecommendedAmount;
  public gasPriceRecommendedAmount: number = INIT_VALUES.gasPriceRecommendedAmount;
  @observable public sendState: SEND_STATE = INIT_VALUES.sendState;
  @observable public errorMessage?: string = INIT_VALUES.errorMessage;
  @computed public get maxTxFee(): number | undefined {
    return this.gasPrice && this.gasLimit
      ? Number(this.gasLimit) * Number(this.gasPrice) * 1e-8 : undefined;
  }
  @computed public get receiverFieldError(): string | undefined {
    return isValidAddress(this.app.sessionStore.isMainNet, this.receiverAddress)
      ? undefined : 'Not a valid Runebase address';
  }
  @computed public get amountFieldError(): string | undefined {
    return this.maxAmount && isValidAmount(Number(this.amount), this.maxAmount) ? undefined : 'Not a valid amount';
  }
  @computed public get gasLimitFieldError(): string | undefined {
    return isValidGasLimit(this.gasLimit) ? undefined : 'Not a valid gas limit';
  }
  @computed public get gasPriceFieldError(): string | undefined {
    return isValidGasPrice(this.gasPrice) ? undefined : 'Not a valid gas price';
  }
  @computed public get buttonDisabled(): boolean {
    const isButtonDisabled = !this.senderAddress || !!this.receiverFieldError || !this.token || !!this.amountFieldError;
    return isButtonDisabled;
  }
  @computed public get maxAmount(): number | undefined {
    if (this.token) {
      if (this.token.symbol === 'RUNES') {
        console.log('Calculating max RUNES amount:', this.maxRunebaseSend);
        return this.maxRunebaseSend;
      }
      console.log('Calculating max token amount:', this.token.balance);
      return this.token!.balance;
    }
    console.log('No token selected. Returning undefined.');
    return undefined;
  }

  private app: AppStore;

  constructor(
    app: AppStore,
  ) {
    makeObservable(this);
    addMessageListener(this.handleMessage);
    this.app = app;
  }

  @action public init = () => {
    this.tokens = [];
    sendMessage({ type: MESSAGE_TYPE.GET_RRC_TOKEN_LIST }, (response: any) => {
      this.verifiedTokens = response;
      this.app.sessionStore.walletInfo?.qrc20Balances.forEach((tokenInfo) => {
        const { name, symbol, decimals, balance, address } = tokenInfo;
        const newToken = new RRCToken(name, symbol, Number(decimals), address);
        const isTokenVerified = this.verifiedTokens.find(x => x.address === newToken.address);
        if (isTokenVerified) {
          newToken.balance = new BigNumber(balance).dividedBy(`1e${decimals}`).toNumber();
          this.tokens.push(newToken);
        } else {
          // TODO: Make a visible unverified token balance list
        }
      });
    });

    this.tokens.unshift(new RRCToken('Runebase Token', 'RUNES', 8, ''));
    this.tokens[0].balance = this.app.sessionStore.walletInfo
      ? Number(this.app.sessionStore.walletInfo.balance) : undefined;
    this.token = this.tokens[0];
    this.senderAddress = this.app.sessionStore.walletInfo
      ? this.app.sessionStore.walletInfo.address : undefined;
    sendMessage({
      type: MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND,
    });
  };

  @action public setGasLimit = (gasLimit: number) => {
    this.gasLimit = gasLimit;
  };
  @action public setGasPrice = (gasPrice: number) => {
    this.gasPrice = gasPrice;
  };
  @action public setSenderAddress = (senderAddress: string) => {
    this.senderAddress = senderAddress;
  };
  @action public setReceiverAddress = (receiverAddress: string) => {
    this.receiverAddress = receiverAddress;
  };
  @action public setTransactionSpeed = (transactionSpeed: string) => {
    this.transactionSpeed = transactionSpeed;
  };
  @action public setAmount = (amount: number | string) => {
    this.amount = amount;
  };

  @action public changeToken = (tokenSymbol: string) => {
    console.log('tokenSymbol: ', tokenSymbol);
    const token = find(this.tokens, { symbol: tokenSymbol });
    if (token) {
      console.log('Changing token to:', token);
      this.token = token;
    }
  };

  @action public routeToSendConfirm = () => {
    this.app?.navigate?.('/send-confirm');
  };

  @action public send = () => {
    if (!this.token) {
      return;
    }

    this.sendState = SEND_STATE.SENDING;
    if (this.token.symbol === 'RUNES') {
      console.log('Sending RUNES:', {
        receiverAddress: this.receiverAddress,
        amount: Number(this.amount),
        transactionSpeed: this.transactionSpeed,
      });
      sendMessage({
        type: MESSAGE_TYPE.SEND_TOKENS,
        receiverAddress: this.receiverAddress,
        amount: Number(this.amount),
        transactionSpeed: this.transactionSpeed,
      });
    } else {
      console.log('Sending RRC tokens:', {
        receiverAddress: this.receiverAddress,
        amount: Number(this.amount),
        token: this.token,
        gasLimit: Number(this.gasLimit),
        gasPrice: Number(this.gasPrice * 1e-8),
      });
      sendMessage({
        type: MESSAGE_TYPE.SEND_RRC_TOKENS,
        receiverAddress: this.receiverAddress,
        amount: Number(this.amount),
        token: this.token,
        gasLimit: Number(this.gasLimit),
        gasPrice: Number(this.gasPrice * 1e-8),
      });
    }
  };

  @action private handleMessage = (request: any) => {
    const requestData = isExtensionEnvironment() ? request : request.data;
    let runebaseToken;
    switch (requestData.type) {
    case MESSAGE_TYPE.SEND_TOKENS_SUCCESS:
      console.log('Send tokens success:', requestData);
      this.app?.navigate?.('/account-detail');
      this.sendState = SEND_STATE.INITIAL;
      break;
    case MESSAGE_TYPE.SEND_TOKENS_FAILURE:
      console.log('Send tokens failure:', requestData);
      this.sendState = SEND_STATE.INITIAL;
      this.errorMessage = requestData.error.message;
      break;
    case MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND_RETURN:
      runebaseToken = this.tokens[0];
      if (runebaseToken) {
        this.maxRunebaseSend = requestData.maxRunebaseAmount / (10 ** runebaseToken.decimals);
      } else {
        this.maxRunebaseSend = 0;
      }
      break;
    default:
      break;
    }
  };
}
