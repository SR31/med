import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const saved = localStorage.getItem('auth');
  if (saved) {
    try {
      const { token } = JSON.parse(saved);
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('auth')) {
      localStorage.removeItem('auth');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'PATIENT' | 'DOCTOR';
}

class UserStore {
  user: User | null = null;
  token: string | null = null;
  error: string | null = null;
  loading = false;

  constructor() {
    makeAutoObservable(this);
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.user = parsed.user;
        this.token = parsed.token;
      } catch {
        localStorage.removeItem('auth');
      }
    }
  }

  async login(email: string, password: string) {
    this.loading = true;
    this.error = null;
    try {
      const { data } = await axios.post('http://localhost:4000/auth/login', { email, password });
      runInAction(() => {
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('auth', JSON.stringify(data));
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.message ?? 'Ошибка соединения с сервером';
      });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async register(email: string, password: string, full_name: string, role: 'PATIENT' | 'DOCTOR') {
    this.loading = true;
    this.error = null;
    try {
      await axios.post('http://localhost:4000/auth/register', { email, password, full_name, role });
      await this.login(email, password);
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.message ?? 'Не удалось зарегистрироваться';
      });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth');
    window.location.reload();
  }

  get isAuthenticated() { return this.user !== null; }
}

export const userStore = new UserStore();
export default userStore;
