import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Card, Button, Modal } from '../App';
import { ChainId, WalletState, TokenBalance } from '../types';
import { NETWORKS, TOKENS, STORAGE_KEYS } from '../constants';
import { WalletService } from '../services/wallet';

interface WalletProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const Wallet: React.FC<WalletProps> = ({ showToast }) => {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  
  // 钱包状态管理
  const [wallets, setWallets] = useState<WalletState[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<ChainId>(ChainId.POLYGON);
  
  // 模态框控制状态
  const [modalType, setModalType] = useState<'none' | 'create' | 'import-mnemonic' | 'import-pk' | 'mnemonic-confirm' | 'confirm-remove'>('none');
  const [modalInputValue, setModalInputValue] = useState('');
  const [pendingRemoveAddr, setPendingRemoveAddr] = useState<string | null>(null);
  
  // 钱包创建状态
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string>('');
  const [confirmedMnemonic, setConfirmedMnemonic] = useState<string>('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  
  // 表单状态
  const [transferToken, setTransferToken] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 资产余额状态
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  
  const activeWallet = useMemo(() => 
    wallets.find(w => w.address === activeAddress) || null
  , [wallets, activeAddress]);

  const currentNetwork = useMemo(() => NETWORKS[currentChainId], [currentChainId]);
  
  // 数据持久化同步
  useEffect(() => {
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
  }, []);
  
  const saveToStorage = (newList: WalletState[], newActive?: string) => {
    setWallets(newList);
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(newList));
    if (newActive) {
      setActiveAddress(newActive);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ADDR, newActive);
    } else if (newList.length === 0) {
      setActiveAddress(null);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ADDR);
    }
  };
  
  const refreshBalances = useCallback(async () => {
    if (!activeWallet) return;
    setLoading(true);
    setError(null);
    try {
      const data = await WalletService.getBalances(activeWallet.address, currentChainId);
      setBalances(data);
      if (data.length > 0 && (!transferToken || !data.some(d => d.symbol === transferToken))) {
        setTransferToken(data[0].symbol);
      }
    } catch (err: any) {
      setError("余额刷新失败，请检查网络连接");
      showToast("余额刷新失败", "error");
    } finally {
      setLoading(false);
    }
  }, [activeWallet, currentChainId, transferToken, showToast]);
  
  useEffect(() => { refreshBalances(); }, [activeWallet, currentChainId, refreshBalances]);
  
  // 关闭所有模态框
  const closeModals = () => {
    setModalType('none');
    setModalInputValue('');
    setPendingRemoveAddr(null);
    setGeneratedMnemonic('');
    setConfirmedMnemonic('');
    setMnemonicWords([]);
  };
  
  // 生成助记词
  const generateMnemonic = () => {
    try {
      const mnemonic = WalletService.generateMnemonic();
      setGeneratedMnemonic(mnemonic);
      setMnemonicWords(mnemonic.split(' '));
      setModalType('mnemonic-confirm');
    } catch (e) {
      showToast("生成助记词失败", "error");
    }
  };
  
  // 确认助记词并创建钱包
  const confirmMnemonicAndCreate = () => {
    if (!generatedMnemonic || !confirmedMnemonic) return;
    
    try {
      if (generatedMnemonic.trim() === confirmedMnemonic.trim()) {
        const newWallet = WalletService.createWalletFromMnemonic(generatedMnemonic);
        saveToStorage([...wallets, newWallet], newWallet.address);
        showToast("钱包创建成功！");
        closeModals();
      } else {
        showToast("助记词不匹配，请重新输入", "error");
      }
    } catch (e) {
      showToast("创建钱包失败", "error");
    }
  };
  
  // 直接创建钱包（跳过助记词确认）
  const handleCreateWallet = () => {
    try {
      const newWallet = WalletService.createRandomWallet();
      saveToStorage([...wallets, newWallet], newWallet.address);
      showToast("新账户创建成功！");
      closeModals();
    } catch (e) {
      showToast("创建账户失败", "error");
    }
  };
  
  // 导入助记词
  const submitImportMnemonic = () => {
    if (!modalInputValue || modalInputValue.trim() === "") return;
    try {
      const imported = WalletService.importFromMnemonic(modalInputValue.trim());
      if (wallets.some(w => w.address === imported.address)) {
        showToast("账户已存在，已为您切换", "info");
        setActiveAddress(imported.address);
      } else {
        saveToStorage([...wallets, imported], imported.address);
        showToast("助记词导入成功！");
      }
      closeModals();
    } catch (e) {
      showToast("导入失败：助记词无效", "error");
    }
  };
  
  // 导入私钥
  const submitImportPK = () => {
    if (!modalInputValue || modalInputValue.trim() === "") return;
    try {
      const imported = WalletService.importFromPrivateKey(modalInputValue.trim());
      if (wallets.some(w => w.address === imported.address)) {
        showToast("账户已存在，已为您切换", "info");
        setActiveAddress(imported.address);
      } else {
        saveToStorage([...wallets, imported], imported.address);
        showToast("私钥导入成功！");
      }
      closeModals();
    } catch (e) {
      showToast("导入失败：私钥格式无效", "error");
    }
  };
  
  // 移除钱包
  const confirmRemoveAccount = () => {
    if (!pendingRemoveAddr) return;
    const newList = wallets.filter(w => w.address !== pendingRemoveAddr);
    let newActive = activeAddress;
    if (activeAddress === pendingRemoveAddr) {
      newActive = newList.length > 0 ? newList[0].address : undefined;
    }
    saveToStorage(newList, newActive);
    showToast("账户已移除");
    closeModals();
  };
  
  // 切换钱包
  const handleSwitchWallet = (addr: string) => {
    setActiveAddress(addr);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ADDR, addr);
    showToast(`已切换至: ${addr.slice(0, 6)}...`);
  };
  
  // 处理转账
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet || !recipient || !amount || !transferToken) return;
    setSending(true); setError(null); setTxHash(null);
    try {
      const hash = await WalletService.sendTransfer(activeWallet.privateKey, currentChainId, transferToken, recipient, amount);
      setTxHash(hash); setAmount(''); setRecipient('');
      showToast("交易已发送，等待确认", "info");
      setTimeout(refreshBalances, 5000);
    } catch (err: any) { 
      setError(err.message || "转账失败：请检查网络或余额"); 
      showToast("转账失败", "error");
    } finally { setSending(false); }
  };
  
  return (
    <>
      {/* 页面头部 */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl rotate-12">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">钱包管理</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mainnet Live</span>
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
            <Button onClick={() => setModalType('import-mnemonic')} variant="outline" className="h-10 px-4 text-xs">助记词导入</Button>
            <Button onClick={() => setModalType('import-pk')} variant="outline" className="h-10 px-4 text-xs">私钥导入</Button>
            <Button onClick={() => setModalType('create')} variant="primary" className="h-10 px-4 text-xs">创建钱包</Button>
          </div>
        </div>
      </header>
      
      {/* 主面板布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 左侧面板 - 钱包列表和资产 */}
        <div className="lg:col-span-4 space-y-8">
          {/* 钱包列表 */}
          <Card className="border-2 border-blue-50 bg-blue-50/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">我的钱包</h3>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{wallets.length} 个钱包</span>
            </div>
            
            {wallets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p className="mb-4">您还没有创建钱包</p>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => setModalType('create')} variant="primary">创建钱包</Button>
                  <Button onClick={() => setModalType('import-mnemonic')} variant="outline">导入助记词</Button>
                  <Button onClick={() => setModalType('import-pk')} variant="outline">导入私钥</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets.map(w => (
                  <div 
                    key={w.address} 
                    className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${activeAddress === w.address ? 'bg-white border-blue-600 ring-4 ring-blue-50 shadow-lg' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-300'}`}
                  >
                    <div onClick={() => handleSwitchWallet(w.address)} className="cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${activeAddress === w.address ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {w.address.slice(2, 4).toUpperCase()}
                        </div>
                        {activeAddress === w.address ? (
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-3 py-1 rounded-full">激活中</span>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingRemoveAddr(w.address);
                              setModalType('confirm-remove');
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-gray-500 break-all font-medium leading-relaxed mb-2">{w.address}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(w.address);
                          showToast("地址已复制到剪切板");
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline" 
                      >
                        复制地址
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* 资产余额 */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">资产余额</h3>
              <button onClick={refreshBalances} disabled={loading} className={`p-2 rounded-xl hover:bg-gray-50 transition-colors ${loading ? 'animate-spin' : ''}`}>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {activeWallet ? (
              <div className="space-y-4">
                {balances.map(t => (
                  <div key={t.symbol} className="flex justify-between items-center p-5 rounded-3xl bg-gray-50 border border-gray-100">
                    <div>
                      <span className="font-black text-gray-900 block text-lg">{t.symbol}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.isNative ? '原生币' : 'USDT 代币'}</span>
                    </div>
                    <span className="text-xl font-black text-gray-900">{Number(t.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>请选择或创建一个钱包</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* 右侧面板 - 转账功能 */}
        <div className="lg:col-span-8">
          <Card className="h-full border-2 border-blue-50">
            <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">快速转账</h3>
            
            {error && <div className="mt-8 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold animate-pulse">{error}</div>}
            {txHash && (
              <div className="mt-8 p-8 bg-green-50 text-green-900 rounded-[2rem] border-2 border-green-100 animate-in zoom-in duration-500">
                <h4 className="text-xl font-black mb-4">交易发送成功！</h4>
                <a href={`${currentNetwork.explorer}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs break-all font-mono font-bold underline hover:text-green-700">{txHash}</a>
              </div>
            )}
            
            {activeWallet ? (
              <form onSubmit={handleTransfer} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">选择币种</label>
                    <select 
                      value={transferToken} 
                      onChange={(e) => setTransferToken(e.target.value)}
                      className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-blue-600 focus:bg-white focus:outline-none font-black transition-all"
                    >
                      {balances.map(b => <option key={b.symbol} value={b.symbol}>{b.symbol} (余额: {Number(b.balance).toFixed(4)})</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">转账金额</label>
                    <div className="relative">
                      <input 
                        type="number" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-blue-600 focus:bg-white focus:outline-none font-black text-2xl"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">接收者地址</label>
                  <input 
                    type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:border-blue-600 focus:bg-white focus:outline-none font-mono text-sm font-bold"
                    placeholder="0x..."
                  />
                </div>
                
                <Button type="submit" disabled={sending || !recipient || !amount} className="w-full py-6 text-xl shadow-2xl shadow-blue-100 rounded-[1.5rem]">
                  {sending ? '正在广播交易...' : '立即确认并发送'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl font-bold mb-4">请先选择或创建一个钱包</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Button onClick={() => setModalType('create')} variant="primary">创建钱包</Button>
                  <Button onClick={() => setModalType('import-mnemonic')} variant="outline">导入钱包</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* 底部共享模态框 */}
      {/* 创建钱包模态框 */}
      <Modal isOpen={modalType === 'create'} onClose={closeModals} title="创建新钱包">
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            您可以选择快速创建钱包或使用助记词创建钱包。助记词创建需要您确认助记词，提供更高的安全性。
          </p>
          <div className="space-y-4">
            <Button onClick={generateMnemonic} variant="primary" className="w-full">
              生成助记词创建
            </Button>
            <Button onClick={handleCreateWallet} variant="outline" className="w-full">
              快速创建（自动保存）
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* 助记词确认模态框 */}
      <Modal isOpen={modalType === 'mnemonic-confirm'} onClose={closeModals} title="确认助记词">
        <div className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">请记下您的助记词</h4>
            <div className="grid grid-cols-3 gap-3">
              {mnemonicWords.map((word, index) => (
                <div key={index} className="bg-white text-center p-3 rounded-lg border border-gray-200 font-mono text-sm">
                  <span className="text-gray-500 text-xs font-bold">{index + 1}</span>
                  <div className="font-bold">{word}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              <strong>重要提示：</strong> 请妥善保管好您的助记词，它是恢复钱包的唯一方式。
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              请输入上面的助记词以确认
            </label>
            <textarea
              value={confirmedMnemonic}
              onChange={(e) => setConfirmedMnemonic(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-mono text-sm h-32"
              placeholder="请按顺序输入助记词，用空格分隔"
            />
          </div>
          
          <Button 
            onClick={confirmMnemonicAndCreate} 
            variant="primary" 
            className="w-full" 
            disabled={!confirmedMnemonic}
          >
            确认并创建钱包
          </Button>
        </div>
      </Modal>
      
      {/* 助记词导入模态框 */}
      <Modal isOpen={modalType === 'import-mnemonic'} onClose={closeModals} title="导入助记词">
        <div className="space-y-6">
          <textarea
            value={modalInputValue}
            onChange={(e) => setModalInputValue(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-mono text-sm h-32"
            placeholder="请输入 12 位助记词，用空格分隔"
          />
          <Button onClick={submitImportMnemonic} className="w-full">立即确认导入</Button>
        </div>
      </Modal>
      
      {/* 私钥导入模态框 */}
      <Modal isOpen={modalType === 'import-pk'} onClose={closeModals} title="导入私钥">
        <div className="space-y-6">
          <input
            type="text"
            value={modalInputValue}
            onChange={(e) => setModalInputValue(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-mono text-sm"
            placeholder="0x..."
          />
          <Button onClick={submitImportPK} className="w-full">立即确认导入</Button>
        </div>
      </Modal>
      
      {/* 移除账户确认模态框 */}
      <Modal isOpen={modalType === 'confirm-remove'} onClose={closeModals} title="移除账户">
        <p className="text-sm text-gray-600 mb-6">确定要移除此账户吗？此操作不可撤销。</p>
        <div className="flex gap-3">
          <Button onClick={closeModals} variant="secondary" className="flex-1">取消</Button>
          <Button onClick={confirmRemoveAccount} variant="danger" className="flex-1">确认移除</Button>
        </div>
      </Modal>
    </>
  );
};

export default Wallet;