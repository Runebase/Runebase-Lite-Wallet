import { isEmpty, split } from 'lodash';
import { pbkdf2 } from 'crypto';

import RunebaseChromeController from '.';
import IController from './iController';
import { STORAGE } from '../../constants';
import { getStorageValue, setStorageValue } from '../../popup/abstraction';
import scrypt from 'scryptsy';
import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;

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

    getStorageValue(STORAGE.APP_SALT).then((appSalt) => {
      if (!isEmpty(appSalt)) {
        const array = split(appSalt, ',').map((str) => parseInt(str, 10));
        this.appSalt = Uint8Array.from(array);
      } else {
        // If no salt is stored, generate a new one
        this.generateAppSaltIfNecessary();
      }

      this.initFinished();
    });

    getStorageValue(STORAGE.SECURITY_ALGORITHM).then((securityAlgorithm) => {
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

  public generateAppSaltIfNecessary = async () => {
    try {
      if (!this.appSalt) {
        const appSalt: Uint8Array = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array;
        this.appSalt = appSalt;

        await setStorageValue(STORAGE.APP_SALT, Array.from(appSalt).join(','));
        console.log('appSalt set');
      }
    } catch (err) {
      throw new Error('Error generating appSalt');
    }
  };

  public setMasterAccountSecurityAlgo = async (algorithm: string) => {
    try {
      this.securityAlgorithm = algorithm;

      await setStorageValue(STORAGE.SECURITY_ALGORITHM, algorithm);
      console.log('securityAlgorithm set');
    } catch (err) {
      throw new Error('Error setting securityAlgorithm');
    }
  };


  public derivePasswordHash = async (
    password: string,
    algorithm: string,
    needsFinishLoginCallback: boolean,
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
      const pbkdf2Async = () => new Promise<string>((resolve, reject) => {
        pbkdf2(
          password,
          Buffer.from(this.appSalt || ''),
          CryptoController.PBKDF2_ITERATIONS,
          CryptoController.PBKDF2_KEY_LENGTH,
          CryptoController.PBKDF2_ALGORITHM,
          (err, derivedKey) => {
            if (err) {
              reject('Error calculating PBKDF2 derivedKey');
            } else {
              resolve(derivedKey.toString('hex'));
            }
          }
        );
      });

      try {
        this.passwordHash = await pbkdf2Async();
        console.log('needs to finish login route? ', needsFinishLoginCallback);
        needsFinishLoginCallback && this.main.account.finishLogin();
      } catch (error) {
        throw new Error(error as any);
      }
    }

    if (pickSecurityAlgorithm === 'Scrypt') {
      try {
        console.log('Calculating scrypt...');
        const derivedKey = scrypt(
          password,
          Buffer.from(this.appSalt),
          CryptoController.SCRYPT_PARAMS_PW.N,
          CryptoController.SCRYPT_PARAMS_PW.r,
          CryptoController.SCRYPT_PARAMS_PW.p,
          64
        );
        this.passwordHash = derivedKey.toString('hex');
        needsFinishLoginCallback && this.main.account.finishLogin();
      } catch (error) {
        // Handle the error
        console.error('Error calculating scrypt:', error);
        throw new Error('Scrypt failed to calculate derivedKey');
      }
    }
  };
}
