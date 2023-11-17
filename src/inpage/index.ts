import { IExtensionAPIMessage, IRPCCallRequest } from '../types';
import { TARGET_NAME, API_TYPE } from '../constants';
import { RunebaseChromeRPCProvider } from './RunebaseChromeRPCProvider';
import { showSignTxWindow } from './window';
import { isMessageNotValid } from '../utils';
import { IInpageAccountWrapper } from '../types';
import { Utils } from './Utils';

const runebasechromeProvider: RunebaseChromeRPCProvider = new RunebaseChromeRPCProvider();
const initUtils: Utils = new Utils();

let runebasechrome: any = {
  rpcProvider: runebasechromeProvider,
  account: null,
  utils: initUtils,
};
let signTxUrl: string;

// Add message listeners
window.addEventListener('message', handleInpageMessage, false);

// expose apis
Object.assign(window, {
  runebasechrome,
});

function handlePortDisconnected() {
  runebasechrome = undefined;
  Object.assign(window, { runebasechrome });
  window.removeEventListener('message', handleInpageMessage, false);
}

/**
 * Handles the sendToContract request originating from the RunebaseChromeRPCProvider and opens the sign tx window.
 * @param request SendToContract request.
 */
const handleSendToContractRequest = (request: IRPCCallRequest) => {
  showSignTxWindow({ url: signTxUrl, request });
};

function handleInpageMessage(event: MessageEvent) {
  if (isMessageNotValid(event, TARGET_NAME.INPAGE)) {
    return;
  }

  const message: IExtensionAPIMessage<any> = event.data.message;
  let accountWrapper: IInpageAccountWrapper;

  switch (message.type) {
  case API_TYPE.SIGN_POD_RESPONSE:
    console.log(`SIGN_POD_RESPONSE INPAGE: ${message.payload.result}`);
    return message.payload.result;
    // break;
  case API_TYPE.SIGN_TX_URL_RESOLVED:
    signTxUrl = message.payload.url;
    break;
  case API_TYPE.RPC_SEND_TO_CONTRACT:
    handleSendToContractRequest(message.payload);
    break;
  case API_TYPE.RPC_RESPONSE:
    return runebasechromeProvider.handleRpcCallResponse(message.payload);
  case API_TYPE.SEND_INPAGE_RUNEBASECHROME_ACCOUNT_VALUES:
    accountWrapper = message.payload;
    runebasechrome.account = accountWrapper.account;
    if (accountWrapper.error) {
      throw accountWrapper.error;
    } else {
      console.log('window.runebasechrome.account has been updated,\n Reason:', accountWrapper.statusChangeReason);
    }
    break;
  case API_TYPE.PORT_DISCONNECTED:
    handlePortDisconnected();
    break;
  default:
    console.log(message);
    throw Error(`Inpage processing invalid type: ${message}`);
  }
}
