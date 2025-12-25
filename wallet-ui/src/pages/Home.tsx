import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, Button, Card } from '../App';
import { ChainId, TokenBalance, WalletState } from '../types';
import { NETWORKS, STORAGE_KEYS } from '../constants';
import { WalletService } from '../services/wallet';
import { ethers } from 'ethers';
import * as walletAddressApi from '@/services/walletAddress'
import { WalletAddressVo } from "@/services/walletAddress/type.ts";

interface HomeProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chainId: ChainId;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

const Home: React.FC<HomeProps> = ({ showToast }) => {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();

  // 钱包状态管理
  const [wallets, setWallets] = useState<WalletAddressVo[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  // 默认连接到Anvil本地网络
  const [currentChainId, setCurrentChainId] = useState<ChainId>(ChainId.ANVIL);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  // 移除不再需要的模态框控制状态

  // 转账表单状态
  const [transferToken, setTransferToken] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  // 交易记录状态
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 钱包创建和导入状态
  const [newWallet, setNewWallet] = useState<WalletState | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [importPrivateKey, setImportPrivateKey] = useState('');
  const [importing, setImporting] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  // 删除钱包状态
  const [deletingWallet, setDeletingWallet] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeWallet = useMemo(() =>
          wallets.find(w => w.address === activeAddress) || null
      , [wallets, activeAddress]);

  const currentNetwork = useMemo(() => NETWORKS[currentChainId], [currentChainId]);

  // Calculate total balance for display in header
  const totalBalance = useMemo(() => {
    if (!balances || balances.length === 0) return '0.00';

    // For simplicity, we'll just display the first token's balance for now
    // In a real app, you might want to calculate the total in USD or ETH
    const firstToken = balances[0];
    return Number(firstToken.balance).toLocaleString(undefined, {
      maximumFractionDigits: 6
    });
  }, [balances]);

  // 从接口获取钱包列表
  const fetchWalletList = async () => {
    try {
      const response = await walletAddressApi.getWalletList({});
      const walletList = response.data
      setWallets(walletList);
      if (walletList.length > 0) {
        setActiveAddress(walletList[0].address);
      }
    } catch (error) {
      showToast('获取钱包列表失败', 'error');
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchWalletList();
  }, []);



  const refreshBalances = useCallback(async () => {
    if (!activeWallet) return;
    setLoading(true);
    try {
      const data = await WalletService.getBalances(activeWallet.address, currentChainId);
      setBalances(data);
      if (data.length > 0 && !transferToken) {
        setTransferToken(data[0].symbol);
      }
    } catch (err: any) {
      showToast("余额刷新失败，请检查网络连接", "error");
    } finally {
      setLoading(false);
    }
  }, [activeWallet, currentChainId, transferToken, showToast]);

  useEffect(() => { refreshBalances(); }, [activeWallet, currentChainId, refreshBalances]);

  // 复制到剪贴板功能
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast(`${label}已复制到剪贴板！`, 'success');
      })
      .catch(() => {
        showToast(`复制${label}失败`, 'error');
      });
  };

  // 直接创建钱包
  const handleCreateWallet = async () => {
    try {
      // 直接创建钱包，不显示模态框
      const nw = WalletService.createRandomWallet();

      // 调用接口保存钱包
      await walletAddressApi.createWallet({
        chain: currentNetwork.name.toLowerCase(),
        address: nw.address,
        privateKey: nw.privateKey,
        mnemonic: nw.mnemonic
      });

      showToast("新账户创建成功！");

      // 显示新创建的钱包信息，包括私钥
      setNewWallet(nw);
      setShowPrivateKey(true);

      // 重新获取钱包列表
      fetchWalletList();
    } catch (e: any) {
      showToast(e.message || "创建账户失败", "error");
    }
  };

  // 私钥导入钱包
  const handleImportWallet = async () => {
    if (!importPrivateKey.trim()) {
      showToast("请输入私钥", "error");
      return;
    }

    try {
      setImporting(true);

      // 使用私钥导入钱包
      const nw = WalletService.importFromPrivateKey(importPrivateKey.trim());

      // 调用接口保存钱包
      await walletAddressApi.createWallet({
        chain: currentNetwork.name.toLowerCase(),
        address: nw.address,
        privateKey: nw.privateKey,
        mnemonic: '' // 私钥导入没有助记词
      });

      showToast("钱包导入成功！");

      // 清空导入表单
      setImportPrivateKey('');
      setShowImportForm(false);

      // 重新获取钱包列表
      fetchWalletList();
    } catch (e: any) {
      showToast(e.message || "导入账户失败", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleSwitchWallet = (addr: string) => {
    setActiveAddress(addr);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ADDR, addr);
    showToast(`已切换至: ${addr.slice(0, 6)}...`);
    // 切换钱包后清空转账表单
    setTransferToken('');
    setRecipient('');
    setAmount('');
    // 立即刷新余额
    refreshBalances();
  };

  // 删除钱包确认
  const handleDeleteWallet = (addr: string) => {
    setDeletingWallet(addr);
  };

  // 取消删除
  const handleCancelDelete = () => {
    setDeletingWallet(null);
  };

  // 执行删除钱包
  const handleConfirmDelete = async () => {
    if (!deletingWallet) return;

    try {
      setDeleting(true);
      const walletOfDelete = wallets.find(item => item.address === deletingWallet)
      await walletAddressApi.deleteWallet(walletOfDelete.id);
      showToast('钱包删除成功！');
      // 更新钱包列表
      await fetchWalletList();

      // 如果删除的是当前活跃钱包，切换到第一个钱包或清空
      if (activeAddress === deletingWallet) {
        const updatedWallets = wallets.filter(w => w.address !== deletingWallet);
        const newActiveAddress = updatedWallets.length > 0 ? updatedWallets[0].address : null;
        setActiveAddress(newActiveAddress);
        if (newActiveAddress) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_ADDR, newActiveAddress);
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_ADDR);
        }
      }

      setDeletingWallet(null);
    } catch (e: any) {
      showToast(e.message || '删除钱包失败', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast("已成功退出");
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet || !recipient || !amount || !transferToken) {
      showToast("请填写完整转账信息", "error");
      return;
    }

    // 1. 金额验证
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      showToast("请输入有效的转账金额", "error");
      return;
    }

    // 2. 验证接收地址格式
    if (!ethers.isAddress(recipient)) {
      showToast("请输入有效的以太坊地址", "error");
      return;
    }

    // 3. 检查余额
    const tokenBalance = balances.find(b => b.symbol === transferToken);
    if (!tokenBalance) {
      showToast("未找到代币余额信息", "error");
      return;
    }

    if (parseFloat(tokenBalance.balance) < transferAmount) {
      showToast("余额不足，请检查您的余额", "error");
      return;
    }

    // 4. 执行转账
    setSending(true);
    try {
      // 获取钱包私钥 - 注意：在生产环境中，私钥应安全存储
      const privateKey = activeWallet.privateKey;
      if (!privateKey) {
        showToast("无法获取钱包私钥", "error");
        return;
      }

      // 调用WalletService执行实际转账
      const txHash = await WalletService.sendTransfer(
        privateKey,
        currentChainId,
        transferToken,
        recipient,
        amount
      );

      // 5. 生成交易记录
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        from: activeWallet.address,
        to: recipient,
        amount: amount,
        token: transferToken,
        chainId: currentChainId,
        txHash: txHash,
        timestamp: Date.now(),
        status: 'pending'
      };

      // 更新交易记录
      setTransactions(prev => [newTransaction, ...prev]);

      // 6. 显示成功信息
      showToast(`转账已发送，交易哈希: ${txHash.slice(0, 10)}...`, "info");

      // 7. 清空表单
      setAmount('');
      setRecipient('');

      // 8. 刷新余额
      await refreshBalances();

    } catch (err: any) {
      // 9. 错误处理
      console.error("转账失败:", err);
      let errorMsg = "转账失败";
      
      if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMsg = "余额不足，无法支付燃气费";
      } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMsg = "无法预测燃气费，请检查接收地址或网络状态";
      } else if (err.code === 'INVALID_ARGUMENT') {
        errorMsg = "参数错误，请检查输入信息";
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      showToast(errorMsg, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* 页面头部 */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">数字钱包Demo</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* 网络选择 */}
          <select
            value={currentChainId}
            onChange={(e) => setCurrentChainId(Number(e.target.value) as ChainId)}
            className="bg-white text-sm font-black uppercase tracking-widest px-4 py-2 rounded-full border border-gray-200 focus:border-blue-600 focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
          >
            {Object.values(NETWORKS).map(net => (
              <option key={net.id} value={net.id}>{net.name} MAINNET</option>
            ))}
          </select>

          {/* 账户管理和注销按钮 */}
          {/*<div className="flex items-center gap-3">*/}
          {/*  <Button variant="outline" className="rounded-full px-5 py-2 text-sm font-bold">*/}
          {/*    账户管理 ({wallets.length})*/}
          {/*  </Button>*/}
          {/*  <Button onClick={handleLogout} variant="danger" className="rounded-full px-5 py-2 text-sm font-bold">*/}
          {/*    注销退出*/}
          {/*  </Button>*/}
          {/*</div>*/}
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <Button variant="outline" className="rounded-full px-5 py-2 text-sm font-bold">
              账户管理 ({wallets.length})
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">{user?.username || user?.email}</span>
              <Button onClick={handleLogout} variant="danger" className="rounded-2xl px-5">
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 欢迎信息 */}
      {/* <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          欢迎回来，<span className="text-blue-600">{user?.username || user?.email}</span>
        </h2>
        <p className="text-gray-500">管理您的 EVM 账户和资产</p>
      </div> */}

      {/* 主面板布局 */}
      <div className="space-y-6">
        {/* 切换或管理账户区域 */}
        <Card className="border-2 border-gray-100 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-gray-800">切换或管理账户</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowImportForm(true)}
                variant="outline"
                className="h-9 px-3 text-xs rounded-full shadow-sm hover:shadow-md"
              >
                导入账户
              </Button>
              <Button
                onClick={handleCreateWallet}
                variant="primary"
                className="h-9 px-3 text-xs rounded-full shadow-sm hover:shadow-md"
              >
                新账户
              </Button>
            </div>
          </div>

          {/* 横向排列的钱包地址 */}
          {wallets.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-3">
              {wallets.map(w => (
                  <div
                      key={w.address}
                      className={`min-w-[200px] p-4 rounded-xl border-2 cursor-pointer transition-all ${activeAddress === w.address ? 'bg-blue-50 border-blue-600 shadow-md' : 'bg-gray-50 border-gray-100 hover:border-blue-400 hover:bg-blue-50/50'}`}
                  >
                    {/* 钱包地址卡片内容 */}
                    <div className="relative group">
                      {/* 删除按钮 - 鼠标悬浮显示 */}
                      <button
                          onClick={(e) => {
                            e.stopPropagation(); // 阻止事件冒泡
                            handleDeleteWallet(w.address);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                          title="删除钱包"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>

                      {/* 点击切换钱包 */}
                      <div onClick={() => handleSwitchWallet(w.address)}>
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-inner mb-2 ${activeAddress === w.address ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {w.address.slice(2, 4).toUpperCase()}
                        </div>
                        <p className="font-mono text-[10px] text-gray-500 break-all font-medium leading-relaxed">{w.address}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </Card>

        {/* 当前钱包信息和资产余额 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：当前钱包信息卡片 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 当前钱包信息 - 深色背景卡片 */}
            {activeWallet && (
              <div className="bg-gray-900 rounded-xl p-5 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black">当前钱包地址</h3>
                  <button
                    onClick={() => copyToClipboard(activeWallet.address, '钱包地址')}
                    className="text-xs text-blue-400 font-black hover:underline"
                  >
                    复制钱包地址
                  </button>
                </div>
                <div className="font-mono text-sm break-all mb-4">
                  {activeWallet.address}
                </div>
              </div>
            )}

            {/* 资产余额 - 优化样式 */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">资产余额</h3>
              {activeWallet ? (
                <div className="space-y-3">
                  {balances.map(t => (
                    <div key={t.symbol} className="flex justify-between items-center p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                          {t.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="font-black text-gray-900">{t.symbol}</div>
                      </div>
                      <span className="text-lg font-black text-gray-900">{Number(t.balance).toFixed(6)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>请选择或创建一个钱包</p>
                </div>
              )}
            </Card>
          </div>

          {/* 右侧：快速转账表单 */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-black text-gray-800 mb-6">快速转账</h3>
              <form onSubmit={handleTransfer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">选择币种</label>
                    <select
                      value={transferToken}
                      onChange={(e) => setTransferToken(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none font-black transition-all"
                    >
                      {balances.map(b => <option key={b.symbol} value={b.symbol}>{b.symbol} (余额: {Number(b.balance).toFixed(4)})</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">转账金额</label>
                    <div className="relative">
                      <input
                        type="number" step="any" required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none font-black text-xl"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">接收地址</label>
                  <input
                    type="text" required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none font-mono text-sm font-bold"
                    placeholder="0x..."
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full py-4 text-base shadow-lg shadow-blue-100 rounded-xl">
                  {sending ? '正在广播交易...' : '立即确认并发送'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* 私钥导入表单模态框 */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-800">通过私钥导入</h3>
              <button
                onClick={() => setShowImportForm(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">私钥</label>
                <input
                  type="text"
                  value={importPrivateKey}
                  onChange={(e) => setImportPrivateKey(e.target.value)}
                  placeholder="请输入16进制私钥"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 focus:outline-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowImportForm(false)}
                  variant="outline"
                  className="flex-1 rounded-xl shadow-sm hover:shadow-md"
                >
                  取消
                </Button>
                <Button
                  onClick={handleImportWallet}
                  disabled={importing}
                  variant="primary"
                  className="flex-1 rounded-xl shadow-sm hover:shadow-md"
                >
                  {importing ? '导入中...' : '导入钱包'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新创建钱包信息显示模态框 */}
      {newWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-green-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                钱包创建成功！
              </h3>
              <button
                onClick={() => setNewWallet(null)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* 钱包地址 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">钱包地址</label>
                  <button
                    onClick={() => copyToClipboard(newWallet.address, '钱包地址')}
                    className="text-xs text-blue-600 font-black hover:underline"
                  >
                    复制
                  </button>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-100 font-mono text-sm break-all">
                  {newWallet.address}
                </div>
              </div>

              {/* 私钥显示 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">私钥</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-xs text-gray-600 font-black hover:underline"
                    >
                      {showPrivateKey ? '隐藏' : '显示'}
                    </button>
                    {showPrivateKey && (
                      <button
                        onClick={() => copyToClipboard(newWallet.privateKey, '私钥')}
                        className="text-xs text-blue-600 font-black hover:underline"
                      >
                        复制
                      </button>
                    )}
                  </div>
                </div>
                <div style={{overflowWrap: 'break-word'}} className="p-4 bg-white rounded-xl border border-gray-100 font-mono text-sm">
                  {showPrivateKey ? newWallet.privateKey : '*****************************'}
                </div>
              </div>

              {/* 安全警告 */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">安全警告</p>
                    <p className="text-xs text-amber-700">
                      请妥善保存您的私钥！私钥是您访问钱包的唯一凭证，一旦丢失将无法恢复。
                    </p>
                  </div>
                </div>
              </div>

              <Button
                  onClick={() => setNewWallet(null)}
                  variant="primary"
                  className="w-full rounded-xl shadow-sm hover:shadow-md"
              >
                完成
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 删除钱包确认模态框 */}
      {deletingWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-red-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  确认删除钱包
                </h3>
                <button
                    onClick={handleCancelDelete}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700">
                    您确定要删除此钱包吗？此操作不可恢复，删除后将无法访问该钱包的资产。
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">钱包地址</div>
                  <div className="font-mono text-sm break-all text-gray-900">
                    {deletingWallet}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                      onClick={handleCancelDelete}
                      variant="outline"
                      className="flex-1 rounded-xl shadow-sm hover:shadow-md"
                      disabled={deleting}
                  >
                    取消
                  </Button>
                  <Button
                      onClick={handleConfirmDelete}
                      variant="danger"
                      className="flex-1 rounded-xl shadow-sm hover:shadow-md"
                      disabled={deleting}
                  >
                    {deleting ? '删除中...' : '确认删除'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
      )}

    </>
  );
};

export default Home;
