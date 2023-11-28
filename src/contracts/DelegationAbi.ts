const delegationsABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: '_staker', type: 'address' },
      { indexed: true, internalType: 'address', name: '_delegate', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'fee', type: 'uint8' },
      { indexed: false, internalType: 'uint256', name: 'blockHeight', type: 'uint256' },
      { indexed: false, internalType: 'bytes', name: 'PoD', type: 'bytes' },
    ],
    name: 'AddDelegation',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: '_staker', type: 'address' },
      { indexed: true, internalType: 'address', name: '_delegate', type: 'address' },
    ],
    name: 'RemoveDelegation',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: '_staker', type: 'address' },
      { internalType: 'uint8', name: '_fee', type: 'uint8' },
      { internalType: 'bytes', name: '_PoD', type: 'bytes' },
    ],
    name: 'addDelegation',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'delegations',
    outputs: [
      { internalType: 'address', name: 'staker', type: 'address' },
      { internalType: 'uint8', name: 'fee', type: 'uint8' },
      { internalType: 'uint256', name: 'blockHeight', type: 'uint256' },
      { internalType: 'bytes', name: 'PoD', type: 'bytes' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'removeDelegation',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default delegationsABI;