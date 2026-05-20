
import { useState } from 'react';
import Modal from './Modal';
import { useAppContext } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { state, dispatch } = useAppContext();
  const { users } = state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        setError('该邮箱已被注册');
        return;
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: new Date(),
        subscription: 'free' as const,
      };

      dispatch({ type: 'ADD_USER', payload: newUser });
      dispatch({ type: 'SET_USER', payload: { ...newUser, password: undefined } });
      dispatch({ type: 'CLEAR_USER_DATA' });
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        setError('邮箱或密码错误');
        return;
      }

      dispatch({ type: 'SET_USER', payload: { ...user, password: undefined } });
    }

    onClose();
    setEmail('');
    setPassword('');
    setName('');
    setIsSignup(false);
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isSignup ? '注册' : '登录'} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {isSignup && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入用户名"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入密码"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isSignup && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            演示账号：user@example.com / 123456
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isSignup ? '注册' : '登录'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isSignup ? '已有账号？' : '还没有账号？'}{' '}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isSignup ? '立即登录' : '免费注册'}
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default LoginModal;

