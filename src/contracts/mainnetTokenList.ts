import RRCToken from '../models/RRCToken';
import { CREDITS_CONTRACT_ADDRESS } from '../constants';

const mainnetTokenList: RRCToken[] = [
  new RRCToken('Credits', 'Credits', 8, CREDITS_CONTRACT_ADDRESS),
];

export default mainnetTokenList;
