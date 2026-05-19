import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

axios.interceptors.request.use((config) => {
  const saved = localStorage.getItem("auth");
  if (saved) {
    try {
      const { token } = JSON.parse(saved);
      if (token) {
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
      localStorage.removeItem("auth");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  date: string;
  status: string;
}

export interface Doctor {
  id: number;
  full_name: string;
  email: string;
}

class AppointmentsStore {
  items: Appointment[] = [];
  doctors: Doctor[] = [];
  loaded = false;
  doctorsLoaded = false;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchDoctors() {
    if (this.doctorsLoaded) return;
    try {
      const { data } = await axios.get<Doctor[]>(
        "http://localhost:4000/auth/doctors",
      );
      runInAction(() => {
        this.doctors = data;
        this.doctorsLoaded = true;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error =
          e.response?.data?.message ?? "Не удалось загрузить список врачей";
      });
    }
  }

  async fetch() {
    if (this.loaded || this.loading) return;
    this.loading = true;
    this.error = null;
    try {
      const { data } = await axios.get<Appointment[]>(
        "http://localhost:4001/appointments",
      );
      runInAction(() => {
        this.items = data;
        this.loaded = true;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.message ?? "Не удалось загрузить записи";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async book(doctor_id: number, date: string) {
    try {
      const { data } = await axios.post<Appointment>(
        "http://localhost:4001/appointments",
        {
          doctor_id,
          date,
        },
      );
      runInAction(() => {
        this.items.push(data);
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.message ?? "Не удалось создать запись";
      });
    }
  }

  async complete(id: number, diagnosis: string, description: string) {
    this.error = null;
    try {
      const { data } = await axios.patch<Appointment>(
        `http://localhost:4001/appointments/${id}/complete`,
        { diagnosis, description },
      );
      runInAction(() => {
        const idx = this.items.findIndex((a) => a.id === id);
        if (idx !== -1) this.items[idx] = data;
      });
      return true;
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.message ?? "Не удалось завершить приём";
      });
      return false;
    }
  }

  invalidate() {
    this.loaded = false;
    this.items = [];
    this.doctorsLoaded = false;
    this.doctors = [];
  }
}

export const appointmentsStore = new AppointmentsStore();
