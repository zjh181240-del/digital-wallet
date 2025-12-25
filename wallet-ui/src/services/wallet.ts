
import { ethers, Wallet, JsonRpcProvider, Contract, formatUnits, parseUnits, HDNodeWallet } from 'ethers';
import { ChainId, WalletState, TokenBalance } from '../types';
import { NETWORKS, TOKENS, ERC20_ABI } from '../constants';

export class WalletService {
  private static providers: Map<ChainId, JsonRpcProvider> = new Map();

  private static getProvider(chainId: ChainId): JsonRpcProvider {
    if (!this.providers.has(chainId)) {
      const config = NETWORKS[chainId];
      this.providers.set(chainId, new JsonRpcProvider(config.rpcUrl));
    }
    return this.providers.get(chainId)!;
  }

  /**
   * 生成助记词
   * @returns 12个单词组成的助记词
   */
  static generateMnemonic(): string {
    const wallet = Wallet.createRandom();
    return wallet.mnemonic?.phrase || '';
  }

  /**
   * 从助记词创建钱包
   * @param mnemonic 助记词
   * @returns 钱包状态
   */
  static createWalletFromMnemonic(mnemonic: string): WalletState {
    const wallet = HDNodeWallet.fromPhrase(mnemonic.trim());
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: mnemonic.trim()
    };
  }

  static createRandomWallet(): WalletState {
    const wallet = Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || ''
    };
  }

  static importFromPrivateKey(pk: string): WalletState {
    // 确保私钥格式正确
    const cleanPk = pk.startsWith('0x') ? pk : `0x${pk}`;
    const wallet = new Wallet(cleanPk);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: '私钥导入账户（无助记词）'
    };
  }

  static importFromMnemonic(phrase: string): WalletState {
    // Ethers v6 使用 HDNodeWallet.fromPhrase
    const wallet = HDNodeWallet.fromPhrase(phrase.trim());
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: phrase.trim()
    };
  }

  static async getBalances(address: string, chainId: ChainId): Promise<TokenBalance[]> {
    const provider = this.getProvider(chainId);
    const tokens = TOKENS.filter(t => t.chainId === chainId);
    
    const balancePromises = tokens.map(async (token) => {
      try {
        if (!token.address) {
          const bal = await provider.getBalance(address);
          return {
            symbol: token.symbol,
            balance: formatUnits(bal, token.decimals),
            isNative: true
          };
        } else {
          const contract = new Contract(token.address, ERC20_ABI, provider);
          const bal = await contract.balanceOf(address);
          return {
            symbol: token.symbol,
            balance: formatUnits(bal, token.decimals),
            isNative: false
          };
        }
      } catch (error) {
        console.error(`余额查询异常 [${token.symbol}]:`, error);
        return { symbol: token.symbol, balance: '0.00', isNative: !token.address };
      }
    });

    return Promise.all(balancePromises);
  }

  static async sendTransfer(
    privateKey: string,
    chainId: ChainId,
    tokenSymbol: string,
    to: string,
    amount: string
  ): Promise<string> {
    const provider = this.getProvider(chainId);
    const wallet = new Wallet(privateKey, provider);
    const token = TOKENS.find(t => t.chainId === chainId && t.symbol === tokenSymbol);

    if (!token) throw new Error("未找到代币配置");

    if (!token.address) {
      const tx = await wallet.sendTransaction({
        to,
        value: parseUnits(amount, token.decimals)
      });
      return tx.hash;
    } else {
      const contract = new Contract(token.address, ERC20_ABI, wallet);
      const tx = await contract.transfer(to, parseUnits(amount, token.decimals));
      return tx.hash;
    }
  }
}
