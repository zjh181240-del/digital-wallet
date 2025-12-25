
export enum ChainId {
  POLYGON = 137,
  BSC = 56,
  ANVIL = 31337 // Anvil本地测试网默认chainId
}

export interface NetworkConfig {
  id: ChainId;
  name: string;
  rpcUrl: string;
  nativeSymbol: string;
  explorer: string;
}

export interface TokenConfig {
  symbol: string;
  name: string;
  address: string | null; // null for native
  decimals: number;
  chainId: ChainId;
}

export interface WalletState {
  address: string;
  privateKey: string;
  mnemonic: string;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  isNative: boolean;
}
