import {
  ContractTransaction,
  BytesLike as Arrayish,
  BigNumber,
  BigNumberish,
  BaseContract,
} from 'ethers'

export declare type EventFilter = {
  address?: string
  topics?: Array<string>
  fromBlock?: string | number
  toBlock?: string | number
}

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>
  /**
   * The nonce to use in the transaction
   */
  nonce?: number
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number
}
export type NameRegistryEvents =
  | 'AdminChanged'
  | 'Approval'
  | 'ApprovalForAll'
  | 'BeaconUpgraded'
  | 'CancelRecovery'
  | 'ChangeFee'
  | 'ChangePool'
  | 'ChangeRecoveryAddress'
  | 'ChangeTrustedCaller'
  | 'ChangeVault'
  | 'DisableTrustedOnly'
  | 'Initialized'
  | 'Invite'
  | 'Paused'
  | 'Renew'
  | 'RequestRecovery'
  | 'RoleAdminChanged'
  | 'RoleGranted'
  | 'RoleRevoked'
  | 'Transfer'
  | 'Unpaused'
  | 'Upgraded'
export interface NameRegistryEventsContext {
  AdminChanged(...parameters: any): EventFilter
  Approval(...parameters: any): EventFilter
  ApprovalForAll(...parameters: any): EventFilter
  BeaconUpgraded(...parameters: any): EventFilter
  CancelRecovery(...parameters: any): EventFilter
  ChangeFee(...parameters: any): EventFilter
  ChangePool(...parameters: any): EventFilter
  ChangeRecoveryAddress(...parameters: any): EventFilter
  ChangeTrustedCaller(...parameters: any): EventFilter
  ChangeVault(...parameters: any): EventFilter
  DisableTrustedOnly(...parameters: any): EventFilter
  Initialized(...parameters: any): EventFilter
  Invite(...parameters: any): EventFilter
  Paused(...parameters: any): EventFilter
  Renew(...parameters: any): EventFilter
  RequestRecovery(...parameters: any): EventFilter
  RoleAdminChanged(...parameters: any): EventFilter
  RoleGranted(...parameters: any): EventFilter
  RoleRevoked(...parameters: any): EventFilter
  Transfer(...parameters: any): EventFilter
  Unpaused(...parameters: any): EventFilter
  Upgraded(...parameters: any): EventFilter
}
export type NameRegistryMethodNames =
  | 'DEFAULT_ADMIN_ROLE'
  | 'approve'
  | 'balanceOf'
  | 'bid'
  | 'cancelRecovery'
  | 'changeFee'
  | 'changePool'
  | 'changeRecoveryAddress'
  | 'changeTrustedCaller'
  | 'changeVault'
  | 'completeRecovery'
  | 'disableTrustedOnly'
  | 'expiryOf'
  | 'fee'
  | 'generateCommit'
  | 'getApproved'
  | 'getRoleAdmin'
  | 'grantRole'
  | 'hasRole'
  | 'initialize'
  | 'isApprovedForAll'
  | 'isTrustedForwarder'
  | 'makeCommit'
  | 'name'
  | 'ownerOf'
  | 'pause'
  | 'paused'
  | 'pool'
  | 'proxiableUUID'
  | 'reclaim'
  | 'recoveryClockOf'
  | 'recoveryDestinationOf'
  | 'recoveryOf'
  | 'register'
  | 'renew'
  | 'renounceRole'
  | 'requestRecovery'
  | 'revokeRole'
  | 'safeTransferFrom'
  | 'safeTransferFrom'
  | 'setApprovalForAll'
  | 'supportsInterface'
  | 'symbol'
  | 'timestampOf'
  | 'tokenURI'
  | 'transferFrom'
  | 'trustedCaller'
  | 'trustedOnly'
  | 'trustedRegister'
  | 'unpause'
  | 'upgradeTo'
  | 'upgradeToAndCall'
  | 'vault'
  | 'withdraw'
export interface AdminChangedEventEmittedResponse {
  previousAdmin: string
  newAdmin: string
}
export interface ApprovalEventEmittedResponse {
  owner: string
  approved: string
  tokenId: BigNumberish
}
export interface ApprovalForAllEventEmittedResponse {
  owner: string
  operator: string
  approved: boolean
}
export interface BeaconUpgradedEventEmittedResponse {
  beacon: string
}
export interface CancelRecoveryEventEmittedResponse {
  by: string
  tokenId: BigNumberish
}
export interface ChangeFeeEventEmittedResponse {
  fee: BigNumberish
}
export interface ChangePoolEventEmittedResponse {
  pool: string
}
export interface ChangeRecoveryAddressEventEmittedResponse {
  tokenId: BigNumberish
  recovery: string
}
export interface ChangeTrustedCallerEventEmittedResponse {
  trustedCaller: string
}
export interface ChangeVaultEventEmittedResponse {
  vault: string
}
export interface InitializedEventEmittedResponse {
  version: BigNumberish
}
export interface InviteEventEmittedResponse {
  inviterId: BigNumberish
  inviteeId: BigNumberish
  fname: Arrayish
}
export interface PausedEventEmittedResponse {
  account: string
}
export interface RenewEventEmittedResponse {
  tokenId: BigNumberish
  expiry: BigNumberish
}
export interface RequestRecoveryEventEmittedResponse {
  from: string
  to: string
  tokenId: BigNumberish
}
export interface RoleAdminChangedEventEmittedResponse {
  role: Arrayish
  previousAdminRole: Arrayish
  newAdminRole: Arrayish
}
export interface RoleGrantedEventEmittedResponse {
  role: Arrayish
  account: string
  sender: string
}
export interface RoleRevokedEventEmittedResponse {
  role: Arrayish
  account: string
  sender: string
}
export interface TransferEventEmittedResponse {
  from: string
  to: string
  tokenId: BigNumberish
}
export interface UnpausedEventEmittedResponse {
  account: string
}
export interface UpgradedEventEmittedResponse {
  implementation: string
}
export interface NameRegistry extends BaseContract {
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  DEFAULT_ADMIN_ROLE(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  approve(
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   */
  balanceOf(
    owner: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   * @param recovery Type: address, Indexed: false
   */
  bid(
    to: string,
    tokenId: BigNumberish,
    recovery: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  cancelRecovery(
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _fee Type: uint256, Indexed: false
   */
  changeFee(
    _fee: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _pool Type: address, Indexed: false
   */
  changePool(
    _pool: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param recovery Type: address, Indexed: false
   */
  changeRecoveryAddress(
    tokenId: BigNumberish,
    recovery: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _trustedCaller Type: address, Indexed: false
   */
  changeTrustedCaller(
    _trustedCaller: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _vault Type: address, Indexed: false
   */
  changeVault(
    _vault: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  completeRecovery(
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  disableTrustedOnly(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  expiryOf(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  fee(overrides?: ContractCallOverrides): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param fname Type: bytes16, Indexed: false
   * @param to Type: address, Indexed: false
   * @param secret Type: bytes32, Indexed: false
   * @param recovery Type: address, Indexed: false
   */
  generateCommit(
    fname: Arrayish,
    to: string,
    secret: Arrayish,
    recovery: string,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  getApproved(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param role Type: bytes32, Indexed: false
   */
  getRoleAdmin(
    role: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  grantRole(
    role: Arrayish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  hasRole(
    role: Arrayish,
    account: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param _tokenName Type: string, Indexed: false
   * @param _tokenSymbol Type: string, Indexed: false
   * @param _vault Type: address, Indexed: false
   * @param _pool Type: address, Indexed: false
   */
  initialize(
    _tokenName: string,
    _tokenSymbol: string,
    _vault: string,
    _pool: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param owner Type: address, Indexed: false
   * @param operator Type: address, Indexed: false
   */
  isApprovedForAll(
    owner: string,
    operator: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param forwarder Type: address, Indexed: false
   */
  isTrustedForwarder(
    forwarder: string,
    overrides?: ContractCallOverrides
  ): Promise<boolean>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param commit Type: bytes32, Indexed: false
   */
  makeCommit(
    commit: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  name(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  ownerOf(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  pause(overrides?: ContractTransactionOverrides): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  paused(overrides?: ContractCallOverrides): Promise<boolean>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  pool(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  proxiableUUID(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  reclaim(
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  recoveryClockOf(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  recoveryDestinationOf(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: uint256, Indexed: false
   */
  recoveryOf(
    parameter0: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param fname Type: bytes16, Indexed: false
   * @param to Type: address, Indexed: false
   * @param secret Type: bytes32, Indexed: false
   * @param recovery Type: address, Indexed: false
   */
  register(
    fname: Arrayish,
    to: string,
    secret: Arrayish,
    recovery: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  renew(
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  renounceRole(
    role: Arrayish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   * @param to Type: address, Indexed: false
   */
  requestRecovery(
    tokenId: BigNumberish,
    to: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param role Type: bytes32, Indexed: false
   * @param account Type: address, Indexed: false
   */
  revokeRole(
    role: Arrayish,
    account: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param operator Type: address, Indexed: false
   * @param approved Type: bool, Indexed: false
   */
  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param interfaceId Type: bytes4, Indexed: false
   */
  supportsInterface(
    interfaceId: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<boolean>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  symbol(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: bytes32, Indexed: false
   */
  timestampOf(
    parameter0: Arrayish,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: pure
   * Type: function
   * @param tokenId Type: uint256, Indexed: false
   */
  tokenURI(
    tokenId: BigNumberish,
    overrides?: ContractCallOverrides
  ): Promise<string>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   * @param tokenId Type: uint256, Indexed: false
   */
  transferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  trustedCaller(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  trustedOnly(overrides?: ContractCallOverrides): Promise<BigNumber>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param fname Type: bytes16, Indexed: false
   * @param to Type: address, Indexed: false
   * @param recovery Type: address, Indexed: false
   * @param inviter Type: uint256, Indexed: false
   * @param invitee Type: uint256, Indexed: false
   */
  trustedRegister(
    fname: Arrayish,
    to: string,
    recovery: string,
    inviter: BigNumberish,
    invitee: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   */
  unpause(
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param newImplementation Type: address, Indexed: false
   */
  upgradeTo(
    newImplementation: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: true
   * Constant: false
   * StateMutability: payable
   * Type: function
   * @param newImplementation Type: address, Indexed: false
   * @param data Type: bytes, Indexed: false
   */
  upgradeToAndCall(
    newImplementation: string,
    data: Arrayish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   */
  vault(overrides?: ContractCallOverrides): Promise<string>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param amount Type: uint256, Indexed: false
   */
  withdraw(
    amount: BigNumberish,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
}
