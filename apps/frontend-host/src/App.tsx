import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { login, register, logout } from './store/userSlice';

const Appointments = lazy(() => import('appointments/App'));
const Medcard = lazy(() => import('medcard/App'));

const AuthForm = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.user);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  const submit = () => {
    if (mode === 'login') {
      dispatch(login({ email, password }));
    } else {
      dispatch(register({ email, password, full_name: fullName, role }));
    }
  };

  return (
    <div className="login">
      <h2>{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</h2>
      <input
        placeholder="Электронная почта"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {mode === 'register' && (
        <>
          <input
            placeholder="Полное имя"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <div className="role-picker">
            <button
              type="button"
              className={`role-option ${role === 'PATIENT' ? 'active' : ''}`}
              onClick={() => setRole('PATIENT')}
            >
              <span className="role-icon">🧑</span>
              <span className="role-text">Пациент</span>
            </button>
            <button
              type="button"
              className={`role-option ${role === 'DOCTOR' ? 'active' : ''}`}
              onClick={() => setRole('DOCTOR')}
            >
              <span className="role-icon">⚕️</span>
              <span className="role-text">Врач</span>
            </button>
          </div>
        </>
      )}
      <button disabled={loading} onClick={submit}>
        {loading
          ? 'Подождите...'
          : mode === 'login'
            ? 'Войти'
            : 'Зарегистрироваться'}
      </button>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode(mode === 'login' ? 'register' : 'login');
          }}
        >
          {mode === 'login' ? 'Создать аккаунт' : 'У меня уже есть аккаунт'}
        </a>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

const App = () => {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();

  if (!user) return <AuthForm />;

  return (
    <BrowserRouter>
      <header>
        <h1>Медицинский портал</h1>
        <nav>
          <Link to="/appointments">Запись на приём</Link>
          {user.role === 'PATIENT' && <Link to="/medcard">Моя медкарта</Link>}
        </nav>
        <span>{user.full_name}</span>
        <button onClick={() => dispatch(logout())}>Выйти</button>
      </header>
      <main>
        <Suspense fallback={<div>Загрузка модуля...</div>}>
          <Routes>
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/medcard" element={<Medcard />} />
            <Route path="*" element={<Navigate to="/appointments" />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
};

export default App;
