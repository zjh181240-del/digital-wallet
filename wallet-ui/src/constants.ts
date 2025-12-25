
import { ChainId, NetworkConfig, TokenConfig } from './types';

// 判断当前运行环境
// import.meta.env.PROD 为 true 时表示生产环境，否则为开发环境
// const isProd = import.meta.env.PROD;
const isProd = import.meta.env.DEV;

console.log(`当前运行环境: ${isProd ? '生产环境' : '开发环境'}`);

// 开发环境（本地Anvil节点）区块链配置
const devNetworks: Record<ChainId, NetworkConfig> = {
  [ChainId.ANVIL]: {
    id: ChainId.ANVIL,
    name: '本地',
    rpcUrl: 'http://127.0.0.1:8545',
    nativeSymbol: 'ETH',
    explorer: 'http://127.0.0.1:8545' // Anvil没有区块浏览器，使用RPC URL代替
  }
};

// 生产环境（主网）区块链配置
const prodNetworks: Record<ChainId, NetworkConfig> = {
  [ChainId.POLYGON]: {
    id: ChainId.POLYGON,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    nativeSymbol: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  [ChainId.BSC]: {
    id: ChainId.BSC,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    nativeSymbol: 'BNB',
    explorer: 'https://bscscan.com'
  }
};

// 开发环境（本地Anvil节点）代币配置
const devTokens: TokenConfig[] = [
  // Anvil Native Token
  {
    symbol: 'ETH',
    name: 'Anvil Native',
    address: null,
    decimals: 18,
    chainId: ChainId.ANVIL
  }
];

// 生产环境（主网）代币配置
const prodTokens: TokenConfig[] = [
  // Polygon Mainnet Tokens
  {
    symbol: 'MATIC',
    name: 'Polygon Native',
    address: null,
    decimals: 18,
    chainId: ChainId.POLYGON
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    chainId: ChainId.POLYGON
  },
  // BSC Mainnet Tokens
  {
    symbol: 'BNB',
    name: 'BNB Native',
    address: null,
    decimals: 18,
    chainId: ChainId.BSC
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    chainId: ChainId.BSC
  }
];

// 根据环境动态导出区块链配置
export const NETWORKS: Record<ChainId, NetworkConfig> = isProd ? prodNetworks : devNetworks;

// 根据环境动态导出代币配置
export const TOKENS: TokenConfig[] = isProd ? prodTokens : devTokens;

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

export const STORAGE_KEYS = {
  WALLETS: 'evm_wallets_list',
  ACTIVE_ADDR: 'evm_active_address'
};
