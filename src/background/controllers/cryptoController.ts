import { isEmpty, split } from 'lodash';
import { pbkdf2 } from 'crypto';

import RunebaseChromeController from '.';
import IController from './iController';
import { STORAGE } from '../../constants';

const INIT_VALUES = {
  securityAlgorithm: undefined,
  appSalt: undefined,
  passwordHash: undefined,
};

export default class CryptoController extends IController {
  // Scrypt
  private static SCRYPT_PARAMS_PW: any = { N: 131072, r: 8, p: 1 };
  // PBKDF2
  private static PBKDF2_ITERATIONS = 500000; // Adjust based on your security requirements
  private static PBKDF2_KEY_LENGTH = 64;
  private static PBKDF2_ALGORITHM = 'sha512';

  public get validPasswordHash(): string {
    if (!this.passwordHash) {
      throw Error('passwordHash should be defined');
    }
    return this.passwordHash!;
  }

  private securityAlgorithm?: string = INIT_VALUES.securityAlgorithm;
  private appSalt?: Uint8Array = INIT_VALUES.appSalt;
  private passwordHash?: string = INIT_VALUES.passwordHash;

  constructor(main: RunebaseChromeController) {
    super('crypto', main);

    chrome.storage.local.get([STORAGE.APP_SALT], ({ appSalt }: any) => {
      if (!isEmpty(appSalt)) {
        const array = split(appSalt, ',').map((str) => parseInt(str, 10));
        this.appSalt = Uint8Array.from(array);
      } else {
        // If no salt is stored, generate a new one
        this.generateAppSaltIfNecessary();
      }

      this.initFinished();
    });

    chrome.storage.local.get([STORAGE.SECURITY_ALGORITHM], ({ securityAlgorithm }: any) => {
      if (!isEmpty(securityAlgorithm)) this.securityAlgorithm = securityAlgorithm;
      this.initFinished();
    });
  }

  public hasValidPasswordHash(): boolean {
    return !!this.passwordHash;
  }

  public resetPasswordHash = () => {
    this.passwordHash = INIT_VALUES.passwordHash;
  };

  public generateAppSaltIfNecessary = () => {
    try {
      if (!this.appSalt) {
        const appSalt: Uint8Array = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array;
        this.appSalt = appSalt;
        chrome.storage.local.set(
          { [STORAGE.APP_SALT]: Array.from(appSalt).join(',') },
          () => console.log('appSalt set'),
        );
      }
    } catch (err) {
      throw Error('Error generating appSalt');
    }
  };

  public setMasterAccountSecurityAlgo = (
    algorithm: string,
  ) => {
    try {
      this.securityAlgorithm = algorithm;
      chrome.storage.local.set(
        { [STORAGE.SECURITY_ALGORITHM]: algorithm },
        () => console.log('securityAlgorithm set'),
      );
    } catch (err) {
      throw Error('Error setting securityAlgorithm');
    }
  };

  public derivePasswordHash = (
    password: string,
    algorithm: string,
  ) => {
    if (!this.appSalt) {
      throw Error('appSalt should not be empty');
    }
    let pickSecurityAlgorithm;
    console.log('this.securityAlgorithm:', this.securityAlgorithm);
    if (this.securityAlgorithm) {
      pickSecurityAlgorithm = this.securityAlgorithm;
    } else {
      this.setMasterAccountSecurityAlgo(algorithm);
      pickSecurityAlgorithm = algorithm;
    }
    console.log('picked algorithm:', pickSecurityAlgorithm);
    if (pickSecurityAlgorithm === 'PBKDF2') {
      console.log('execute PBKDF2');
      pbkdf2(
        password,
        Buffer.from(this.appSalt),
        CryptoController.PBKDF2_ITERATIONS,
        CryptoController.PBKDF2_KEY_LENGTH,
        CryptoController.PBKDF2_ALGORITHM,
        (err, derivedKey) => {
          if (err) {
            throw Error('Error calculating PBKDF2 derivedKey');
          }
          this.passwordHash = derivedKey.toString('hex');
          this.main.account.finishLogin();
        }
      );
    }
    if (pickSecurityAlgorithm === 'Scrypt') {
      /*
      * Create a web worker for the scrypt key derivation, so that it doesn't freeze the loading screen ui.
      * File path relative to post bundling of webpack. worker-loader node module did not work for me,
      * possibly a compatibility issue with chrome.
      */
      console.log('Scrypt');
      let sww;
      if (typeof(sww) === 'undefined') {
        sww = new Worker('./scryptworker.js');

        sww.postMessage({
          password,
          salt: this.appSalt,
          scryptParams: CryptoController.SCRYPT_PARAMS_PW,
        });

        sww.onmessage = (e) => {
          console.log(e);
          if (e.data.err) {
            throw Error('scrypt failed to calculate derivedKey');
          }
          this.passwordHash = e.data.passwordHash;
          this.main.account.finishLogin();
        };
      }
    }
  };
}
