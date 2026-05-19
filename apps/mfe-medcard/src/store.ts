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
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  description: string;
  created_at: string;
}

class MedcardStore {
  items: MedicalRecord[] = [];
  loaded = false;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetch() {
    if (this.loaded || this.loading) return;
    this.loading = true;
    this.error = null;
    try {
      const { data } = await axios.get<MedicalRecord[]>('http://localhost:4001/records');
      runInAction(() => {
        this.items = data;
        this.loaded = true;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.message ?? 'Не удалось загрузить медицинскую карту';
      });
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  invalidate() {
    this.loaded = false;
    this.items = [];
  }
}

export const medcardStore = new MedcardStore();
