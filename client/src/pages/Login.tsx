import { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import MainApp from './App';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [logged, setlogged] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPass, setRegisterPass] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

  useEffect(() => {
    const checkLoginStatus = async () => {
      // check google/passowrd login validity
      try {
        // Token a query-ből (Google login után)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
          localStorage.setItem('token', token);
          setlogged(true);
          // Optionálisan: töröljük a query parametert
          window.history.replaceState({}, document.title, '/');
          return;
        }

        const userData = await localStorage.getItem('token');
        if (!userData) {
          setlogged(false);
          return;
        }
        const res = await fetch(`${apiUrl}/auth/userInDb`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData}`,
          },
        });
        if (!res.ok) {
          localStorage.removeItem('token');
          setlogged(false);
          return;
        }
        const data = await res.json();
        if (data.exists) setlogged(true);
        else {
          localStorage.removeItem('token');
          setlogged(false);
        }
      } catch (e) {
        console.error('Failed to fetch user data', e);
        localStorage.removeItem('token');
        setlogged(false);
      }
    };
    checkLoginStatus();
  }, [apiUrl]);

  const handleLogin = async () => {
    if (loginName && loginPass) {
      const user = {
        name: loginName,
        password: loginPass,
      };
      try {
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
        const data = await response.json();
        if (data.response === 1) {
          localStorage.setItem('token', data.token);
          setlogged(true);
          setShowLogin(false);
          setAlertMsg(t('login.successLogin'));
          setAlertType('success');
        } else {
          setAlertMsg(t('login.errorInvalidCredentials'));
          setAlertType('error');
        }
      } catch {
        setAlertMsg(t('login.errorServer'));
        setAlertType('error');
      }
    } else {
      setAlertMsg(t('login.errorEnterCredentials'));
      setAlertType('error');
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    if (registerName && registerEmail && registerPass.length >= 8) {
      if (!validateEmail(registerEmail)) {
        setAlertMsg(t('login.errorEmailInvalid'));
        setAlertType('error');
        return;
      }
      const user = {
        name: registerName,
        email: registerEmail,
        password: registerPass,
      };
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      let data = null;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        console.error('Invalid JSON from server:', err);
      }

      if (!data) {
        setAlertMsg(t('login.errorUnexpectedResponse'));
        setAlertType('error');
        return;
      }

      if (data.response === 0) {
        setAlertMsg(t('login.errorUserExists'));
        setAlertType('error');
        return;
      } else if (data.response === 1) {
        localStorage.setItem('token', data.token);
        setlogged(true);
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPass('');
        setAlertMsg(t('login.successRegister'));
        setAlertType('success');
      } else {
        setAlertMsg(t('login.errorRegisterFailed'));
        setAlertType('error');
        return;
      }
    } else {
      setAlertMsg(t('login.errorFillFields'));
      setAlertType('error');
    }
  };

  const handleLogout = async () => {
    try {
      await localStorage.removeItem('user');
      await localStorage.removeItem('token');
      setlogged(false);
      setShowLogin(true);
      setLoginName('');
      setLoginPass('');
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPass('');
      setAlertMsg(t('login.successLogout'));
      setAlertType('success');
      document.location.href = `${import.meta.env.VITE_API_URL}/auth/logout`;
    } catch (e) {
      console.error('Failed to remove user data', e);
    }
  };

  return (
    <>
      {logged ? (
        <div className="flex items-center justify-center w-full h-[100vh] bg-gray-200">
          <div className="2xl:w-[65vw] w-full h-full">
            <MainApp onLogout={handleLogout} />
          </div>
        </div>
      ) : (
        <div className="flex w-full h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {alertMsg && (
            <Alert message={alertMsg} type={alertType} onClose={() => setAlertMsg(null)} />
          )}
          <div className="flex items-center text-center justify-center w-full h-full px-3">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl items-center justify-center py-3 px-4 sm:py-6 sm:px-6">
              <div className="flex flex-wrap justify-center gap-1.5 mb-4 sm:mb-6">
                <button
                  className={`rounded-lg px-3 sm:px-6 py-1.5 sm:py-2 font-medium transition-all cursor-pointer text-sm sm:text-base ${showLogin ? 'bg-[#3a3a3cff] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setShowLogin(true)}
                >
                  {t('login.loginTab')}
                </button>
                <button
                  className={`rounded-lg px-3 sm:px-6 py-1.5 sm:py-2 font-medium transition-all cursor-pointer text-sm sm:text-base ${!showLogin ? 'bg-[#3a3a3cff] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setShowLogin(false)}
                >
                  {t('login.registerTab')}
                </button>
              </div>

              {showLogin ? (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4 text-center">
                    {t('login.loginTitle')}
                  </p>
                  <input
                    className="bg-gray-50 rounded-lg w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.username')}
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    autoCapitalize="none"
                  />
                  <input
                    className="bg-gray-50 rounded-lg w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.password')}
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                  <button
                    className="bg-[#3a3a3cff] mt-2 sm:mt-4 mb-[-0.5rem] w-full p-2 sm:p-3 rounded-lg text-white font-medium text-sm sm:text-base hover:bg-[#4a4a4cff] transition-all active:scale-95 cursor-pointer"
                    onClick={handleLogin}
                  >
                    {t('login.loginButton')}
                  </button>
                  <button
                    className="bg-red-500 mt-2 sm:mt-4 w-full p-2 sm:p-3 rounded-lg text-white font-medium text-sm sm:text-base hover:bg-red-600 transition-all cursor-pointer"
                    onClick={() =>
                      (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)
                    }
                  >
                    {t('login.googleLogin')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4 text-center">
                    {t('login.registerTitle')}
                  </p>
                  <input
                    className="bg-gray-50 rounded-lg w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.username')}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    autoCapitalize="none"
                  />
                  <input
                    className="bg-gray-50 rounded-lg w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.email')}
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    autoCapitalize="none"
                  />
                  <input
                    className="bg-gray-50 rounded-lg w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('login.password')}
                    type="password"
                    value={registerPass}
                    onChange={(e) => setRegisterPass(e.target.value)}
                  />
                  <button
                    className="bg-[#3a3a3cff] mt-2 sm:mt-4 mb-[-0.5rem] w-full p-2 sm:p-3 rounded-lg text-white font-medium text-sm sm:text-base hover:bg-[#4a4a4cff] transition-all active:scale-95 cursor-pointer"
                    onClick={handleRegister}
                  >
                    {t('login.registerButton')}
                  </button>
                  <button
                    className="bg-red-500 mt-2 sm:mt-4 w-full p-2 sm:p-3 rounded-lg text-white font-medium text-sm sm:text-base hover:bg-red-600 transition-all cursor-pointer"
                    onClick={() =>
                      (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)
                    }
                  >
                    {t('login.googleLogin')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
