import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { AuthContext } from '../App';
import { Card, Button } from '../App';
import { ChainId, WalletState, TokenBalance } from '../types';
import { NETWORKS, STORAGE_KEYS } from '../constants';
import { WalletService } from '../services/wallet';

interface Transaction {
  id: string;
  userEmail: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chainId: ChainId;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

interface TransactionsProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Transactions: React.FC<TransactionsProps> = ({ showToast }) => {
  const { user } = useContext(AuthContext)!;
  
  // 钱包状态管理
  const [wallets, setWallets] = useState<WalletState[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<ChainId>(ChainId.POLYGON);
  
  // 交易记录状态
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 筛选状态
  const [filterChainId, setFilterChainId] = useState<ChainId | 'all'>(ChainId.POLYGON);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  
  const activeWallet = useMemo(() => 
    wallets.find(w => w.address === activeAddress) || null
  , [wallets, activeAddress]);

  const currentNetwork = useMemo(() => NETWORKS[currentChainId], [currentChainId]);
  
  // 数据持久化同步
  useEffect(() => {
    // 加载钱包数据
    const storedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
    const storedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_ADDR);
    if (storedWallets) {
      try {
        const parsed = JSON.parse(storedWallets);
        setWallets(parsed);
        if (storedActive && parsed.some((w: any) => w.address === storedActive)) {
          setActiveAddress(storedActive);
        } else if (parsed.length > 0) {
          setActiveAddress(parsed[0].address);
        }
      } catch (e) {
        localStorage.clear();
      }
    }
    
    // 加载交易记录
    loadTransactions();
  }, []);
  
  // 加载交易记录
  const loadTransactions = () => {
    try {
      const storedTransactions = localStorage.getItem('evm_transactions');
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions) as Transaction[];
        setTransactions(parsed);
        setFilteredTransactions(parsed);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
      setTransactions([]);
      setFilteredTransactions([]);
    }
  };
  
  // 保存交易记录
  const saveTransaction = (transaction: Transaction) => {
    try {
      const storedTransactions = localStorage.getItem('evm_transactions');
      const currentTransactions = storedTransactions ? JSON.parse(storedTransactions) as Transaction[] : [];
      const updatedTransactions = [transaction, ...currentTransactions];
      localStorage.setItem('evm_transactions', JSON.stringify(updatedTransactions));
      loadTransactions();
    } catch (e) {
      console.error('Failed to save transaction:', e);
    }
  };
  
  // 应用筛选
  useEffect(() => {
    let filtered = transactions;
    
    // 按链筛选
    if (filterChainId !== 'all') {
      filtered = filtered.filter(tx => tx.chainId === filterChainId);
    }
    
    // 按状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }
    
    // 按当前钱包地址筛选
    if (activeAddress) {
      filtered = filtered.filter(tx => tx.from === activeAddress || tx.to === activeAddress);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, filterChainId, filterStatus, activeAddress]);
  
  // 获取交易状态样式
  const getStatusStyle = (status: 'pending' | 'completed' | 'failed'): string => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-600',
      completed: 'bg-green-100 text-green-600',
      failed: 'bg-red-100 text-red-600'
    };
    return statusStyles[status];
  };
  
  // 获取交易状态文本
  const getStatusText = (status: 'pending' | 'completed' | 'failed'): string => {
    const statusTexts = {
      pending: '待确认',
      completed: '已完成',
      failed: '失败'
    };
    return statusTexts[status];
  };
  
  // 格式化日期
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // 切换钱包
  const handleSwitchWallet = (addr: string) => {
    setActiveAddress(addr);
  };
  
  // 导出交易记录
  const exportTransactions = () => {
    try {
      const data = JSON.stringify(filteredTransactions, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('交易记录导出成功！');
    } catch (e) {
      showToast('导出失败', 'error');
    }
  };
  
  // 清除交易记录
  const clearTransactions = () => {
    if (window.confirm('确定要清除所有交易记录吗？此操作不可撤销。')) {
      try {
        localStorage.removeItem('evm_transactions');
        setTransactions([]);
        setFilteredTransactions([]);
        showToast('交易记录已清除');
      } catch (e) {
        showToast('清除失败', 'error');
      }
    }
  };
  
  return (
    <>
      {/* 页面头部 */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl rotate-12">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">交易记录</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">共 {filteredTransactions.length} 条记录</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
          <select 
            value={currentChainId}
            onChange={(e) => setCurrentChainId(Number(e.target.value) as ChainId)}
            className="bg-gray-50 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border-none focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {Object.values(NETWORKS).map(net => (
              <option key={net.id} value={net.id}>{net.name}</option>
            ))}
          </select>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex gap-3">
            <Button onClick={exportTransactions} variant="outline" className="h-10 px-4 text-xs">导出记录</Button>
            <Button onClick={clearTransactions} variant="danger" className="h-10 px-4 text-xs">清除记录</Button>
          </div>
        </div>
      </header>
      
      {/* 主面板布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          {/* 钱包列表 */}
          <Card className="border-2 border-blue-50 bg-blue-50/20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-800">我的钱包</h3>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{wallets.length} 个钱包</span>
            </div>
            
            {wallets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="mb-4">您还没有创建钱包</p>
                <Button variant="outline">创建钱包</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets.map(w => (
                  <div 
                    key={w.address} 
                    onClick={() => handleSwitchWallet(w.address)}
                    className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${activeAddress === w.address ? 'bg-white border-blue-600 ring-4 ring-blue-50 shadow-lg' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${activeAddress === w.address ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {w.address.slice(2, 4).toUpperCase()}
                      </div>
                      {activeAddress === w.address ? (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">激活中</span>
                      ) : null}
                    </div>
                    <p className="font-mono text-[11px] text-gray-800 break-all font-medium leading-relaxed">{w.address}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* 筛选面板 */}
          <Card className="border-2 border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">筛选网络</label>
                <select 
                  value={filterChainId}
                  onChange={(e) => setFilterChainId(e.target.value as ChainId | 'all')}
                  className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none font-medium transition-all"
                >
                  <option value="all">所有网络</option>
                  {Object.values(NETWORKS).map(net => (
                    <option key={net.id} value={net.id}>{net.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">筛选状态</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed' | 'failed')}
                  className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none font-medium transition-all"
                >
                  <option value="all">所有状态</option>
                  <option value="pending">待确认</option>
                  <option value="completed">已完成</option>
                  <option value="failed">失败</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
        
        {/* 交易记录列表 */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-2 border-blue-50 bg-blue-50/20">
            <h3 className="text-xl font-black text-gray-800 mb-8">交易历史</h3>
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-lg font-bold">暂无交易记录</p>
                <p className="text-sm mt-2">您的交易记录将显示在这里</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTransactions.map(tx => (
                  <Card key={tx.id} className="border-2 border-gray-100 bg-white hover:shadow-xl transition-all">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                      {/* 交易基本信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full ${getStatusStyle(tx.status)}`}>
                            {getStatusText(tx.status)}
                          </span>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{formatDate(tx.timestamp)}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">发送方</span>
                            <span className="text-sm font-mono font-bold text-gray-900">{tx.from.slice(0, 10)}...{tx.from.slice(-6)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">接收方</span>
                            <span className="text-sm font-mono font-bold text-gray-900">{tx.to.slice(0, 10)}...{tx.to.slice(-6)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span className="text-sm font-black text-gray-700">金额</span>
                            <span className="text-xl font-black text-blue-600">
                              {Number(tx.amount).toFixed(6)} {tx.token}
                            </span>
                          </div>
                        </div>
                      </div>
                       
                      {/* 交易详情 */}
                      <div className="flex flex-col items-end gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">交易详情</div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">交易哈希</span>
                              <span className="font-mono font-bold text-gray-900">{tx.txHash.slice(0, 12)}...</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">网络</span>
                              <span className="font-bold text-gray-900">{NETWORKS[tx.chainId].name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">代币</span>
                              <span className="font-bold text-gray-900">{tx.token}</span>
                            </div>
                          </div>
                        </div>
                         
                        {/* 查看交易按钮 */}
                        <a 
                          href={`${NETWORKS[tx.chainId].explorer}/tx/${tx.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors underline"
                        >
                          查看交易详情
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default Transactions;