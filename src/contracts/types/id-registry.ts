import {
  ContractTransaction,
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
export type IdRegistryEvents =
  | 'CancelRecovery'
  | 'ChangeHome'
  | 'ChangeRecoveryAddress'
  | 'ChangeTrustedCaller'
  | 'DisableTrustedOnly'
  | 'OwnershipTransferred'
  | 'Register'
  | 'RequestRecovery'
  | 'Transfer'
export interface IdRegistryEventsContext {
  CancelRecovery(...parameters: any): EventFilter
  ChangeHome(...parameters: any): EventFilter
  ChangeRecoveryAddress(...parameters: any): EventFilter
  ChangeTrustedCaller(...parameters: any): EventFilter
  DisableTrustedOnly(...parameters: any): EventFilter
  OwnershipTransferred(...parameters: any): EventFilter
  Register(...parameters: any): EventFilter
  RequestRecovery(...parameters: any): EventFilter
  Transfer(...parameters: any): EventFilter
}
export type IdRegistryMethodNames =
  | 'cancelRecovery'
  | 'changeHome'
  | 'changeRecoveryAddress'
  | 'completeRecovery'
  | 'idOf'
  | 'register'
  | 'requestRecovery'
  | 'trustedRegister'
export interface CancelRecoveryEventEmittedResponse {
  by: string
  id: BigNumberish
}
export interface ChangeHomeEventEmittedResponse {
  id: BigNumberish
  url: string
}
export interface ChangeRecoveryAddressEventEmittedResponse {
  id: BigNumberish
  recovery: string
}
export interface ChangeTrustedCallerEventEmittedResponse {
  trustedCaller: string
}
export interface OwnershipTransferredEventEmittedResponse {
  previousOwner: string
  newOwner: string
}
export interface RegisterEventEmittedResponse {
  to: string
  id: BigNumberish
  recovery: string
  url: string
}
export interface RequestRecoveryEventEmittedResponse {
  from: string
  to: string
  id: BigNumberish
}
export interface TransferEventEmittedResponse {
  from: string
  to: string
  id: BigNumberish
}
export interface IdRegistry extends BaseContract {
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   */
  cancelRecovery(
    from: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param url Type: string, Indexed: false
   */
  changeHome(
    url: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param recovery Type: address, Indexed: false
   */
  changeRecoveryAddress(
    recovery: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   */
  completeRecovery(
    from: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: true
   * StateMutability: view
   * Type: function
   * @param parameter0 Type: address, Indexed: false
   */
  idOf(
    parameter0: string,
    overrides?: ContractCallOverrides
  ): Promise<BigNumber>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param to Type: address, Indexed: false
   * @param recovery Type: address, Indexed: false
   * @param url Type: string, Indexed: false
   */
  register(
    to: string,
    recovery: string,
    url: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param from Type: address, Indexed: false
   * @param to Type: address, Indexed: false
   */
  requestRecovery(
    from: string,
    to: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
  /**
   * Payable: false
   * Constant: false
   * StateMutability: nonpayable
   * Type: function
   * @param to Type: address, Indexed: false
   * @param recovery Type: address, Indexed: false
   * @param url Type: string, Indexed: false
   */
  trustedRegister(
    to: string,
    recovery: string,
    url: string,
    overrides?: ContractTransactionOverrides
  ): Promise<ContractTransaction>
}
