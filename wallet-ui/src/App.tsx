import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css'
import { LoginUser } from "@/services/auth/type.ts";

// ========== 1. AuthContext 定义 ==========
interface AuthContextType {
  isAuthenticated: boolean;
  user?: LoginUser | null;
  login: (userData: LoginUser) => void;
  logout: () => void;
  register: (userData: LoginUser) => void;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  loading: true
});

// ========== 2. AuthProvider 组件 ==========
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((userData: LoginUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_user');
  }, []);

  const register = useCallback((userData: LoginUser) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as LoginUser;
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_user');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const contextValue = useMemo<AuthContextType>(() => ({
    isAuthenticated,
    user,
    login,
    logout,
    register,
    loading
  }), [isAuthenticated, user, login, logout, register, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children} {/* 不再在这里加 loading 占位，移到内容组件 */}
    </AuthContext.Provider>
  );
};

// ========== 3. 通用UI组件 ==========
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false, 
  className = "", 
  type = "button" 
}) => {
  const base = "px-4 py-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-100",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 border border-red-100",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50 active:scale-95",
    outline: "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ========== 4. Notification 组件 ==========
const Notification: React.FC<{
  message: string | null;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (message) {
      timer = setTimeout(() => {
        onClose();
      }, 4000);
    }
    return () => timer && clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: "bg-green-600 shadow-green-200",
    error: "bg-red-600 shadow-red-200",
    info: "bg-blue-600 shadow-blue-200"
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
      <div className={`${styles[type]} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm min-w-[280px]`}>
        {type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

// ========== 5. Modal 组件 ==========
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  scrollable?: boolean;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md', scrollable = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      onClose();
    }
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className={`bg-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-black text-gray-900 uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 p-1 rounded-full"
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`p-6 ${scrollable ? 'max-h-[80vh] overflow-y-auto' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ========== 6. ProtectedRoute 组件 ==========
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 font-bold">验证身份中...</p>
      </div>
    );
  }

  const whiteList = ['/login', '/register', '/social-callback'];
  const isPathMatch = (pattern: string, path: string) => {
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^\\/]*');
    return new RegExp(`^${regexPattern}$`).test(path);
  };

  const isInWhiteList = whiteList.some(pattern => isPathMatch(pattern, location.pathname));

  if (!isAuthenticated && !isInWhiteList) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ========== 7. 懒加载封装 ==========
const LazyLoadWithFallback = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  const Component = React.lazy(importFunc);
  return (props: any) => (
    <React.Suspense fallback={<div className="text-center py-20">加载中...</div>}>
      <Component {...props} />
    </React.Suspense>
  );
};

const Login = LazyLoadWithFallback(() => import('@/pages/Login'));
const Register = LazyLoadWithFallback(() => import('@/pages/Register'));
const Home = LazyLoadWithFallback(() => import('@/pages/Home'));
const Wallet = LazyLoadWithFallback(() => import('@/pages/Wallet'));
const Transactions = LazyLoadWithFallback(() => import('@/pages/Transactions'));

// ========== 8. 内容组件（消费 Context） ==========
const AppContent: React.FC = () => {
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const { isAuthenticated, loading } = useContext(AuthContext); // 正确消费

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ msg, type });
  }, []);

  // 全局加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="max-w-6xl mx-auto py-10 px-6 min-h-screen">
        <Notification
          message={notification?.msg || null}
          type={notification?.type || 'success'}
          onClose={() => setNotification(null)}
        />

        <Routes>
          <Route path="/login" element={<Login showToast={showToast} />} />
          <Route path="/register" element={<Register showToast={showToast} />} />
          <Route path="/" element={<ProtectedRoute><Home showToast={showToast} /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet showToast={showToast} /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions showToast={showToast} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>

        <footer className="mt-24 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">测试</p>
        </footer>
      </div>
    </Router>
  );
};

// ========== 9. 根组件 ==========
const RootApp: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// 导出根组件
export default RootApp;
export { Card, Button, Modal, AuthContext };