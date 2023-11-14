import { observable, computed, action } from 'mobx';
import { find } from 'lodash';

import AppStore from './AppStore';
import { SEND_STATE, MESSAGE_TYPE, TRANSACTION_SPEED } from '../../constants';
import { isValidAddress, isValidAmount, isValidGasLimit, isValidGasPrice } from '../../utils';
import QRCToken from '../../models/QRCToken';
import Config from '../../config';

const INIT_VALUES = {
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
  gasPrice: Config.TRANSACTION.DEFAULT_GAS_PRICE * 1e8,
  gasLimitRecommendedAmount: Config.TRANSACTION.DEFAULT_GAS_LIMIT,
  gasPriceRecommendedAmount: Config.TRANSACTION.DEFAULT_GAS_PRICE * 1e8, // satoshi/gas
};

export default class SendStore {
  @observable public tokens: QRCToken[] = INIT_VALUES.tokens;
  @observable public senderAddress?: string = INIT_VALUES.senderAddress;
  @observable public receiverAddress?: string = INIT_VALUES.receiverAddress;
  @observable public token?: QRCToken = INIT_VALUES.token;
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
    return !this.senderAddress || !!this.receiverFieldError || !this.token || !!this.amountFieldError;
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

  constructor(app: AppStore) {
    this.app = app;
  }

  @action
  public init = () => {
    chrome.runtime.onMessage.addListener(this.handleMessage);
    chrome.runtime.sendMessage({ type: MESSAGE_TYPE.GET_QRC_TOKEN_LIST }, (response: any) => {
      console.log('Received token list:', response);
      this.tokens = response;
      this.tokens.unshift(new QRCToken('Runebase Token', 'RUNES', 8, ''));
      this.tokens[0].balance = this.app.sessionStore.info ? this.app.sessionStore.info.balance : undefined;
      this.token = this.tokens[0];
    });
    this.senderAddress = this.app.sessionStore.info ? this.app.sessionStore.info.addrStr : undefined;
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND,
    });
  };

  @action
  public changeToken = (tokenSymbol: string) => {
    const token = find(this.tokens, { symbol: tokenSymbol });
    if (token) {
      console.log('Changing token to:', token);
      this.token = token;
    }
  };

  @action
  public routeToSendConfirm = () => {
    this.app.routerStore.push('/send-confirm');
  };

  @action
  public send = () => {
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
      chrome.runtime.sendMessage({
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
        gasPrice: Number(this.gasPrice),
      });
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPE.SEND_QRC_TOKENS,
        receiverAddress: this.receiverAddress,
        amount: Number(this.amount),
        token: this.token,
        gasLimit: Number(this.gasLimit),
        gasPrice: Number(this.gasPrice),
      });
    }
  };

  @action
  private handleMessage = (request: any) => {
    let runebaseToken;
    switch (request.type) {
      case MESSAGE_TYPE.SEND_TOKENS_SUCCESS:
        console.log('Send tokens success:', request);
        this.app.routerStore.push('/home'); // so pressing back won't go back to sendConfirm page
        this.app.routerStore.push('/account-detail');
        this.sendState = SEND_STATE.INITIAL;
        break;
      case MESSAGE_TYPE.SEND_TOKENS_FAILURE:
        console.log('Send tokens failure:', request);
        this.sendState = SEND_STATE.INITIAL;
        this.errorMessage = request.error.message;
        break;
      case MESSAGE_TYPE.GET_MAX_RUNEBASE_SEND_RETURN:
        runebaseToken = this.tokens[0];
        this.maxRunebaseSend = request.maxRunebaseAmount / (10 ** runebaseToken.decimals);
        break;
      default:
        break;
    }
  };
}
