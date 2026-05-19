import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
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

interface State {
  items: Appointment[];
  doctors: Doctor[];
  loaded: boolean;
  doctorsLoaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  items: [],
  doctors: [],
  loaded: false,
  doctorsLoaded: false,
  loading: false,
  error: null
};

export const fetchAppointments = createAsyncThunk<
  Appointment[],
  void,
  { state: { appointments: State }; rejectValue: string }
>('appointments/fetch', async (_, { getState, rejectWithValue }) => {
  if (getState().appointments.loaded) {
    return getState().appointments.items;
  }
  try {
    const { data } = await axios.get<Appointment[]>('http://localhost:4001/appointments');
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message ?? 'Не удалось загрузить записи');
  }
});

export const fetchDoctors = createAsyncThunk<
  Doctor[],
  void,
  { state: { appointments: State }; rejectValue: string }
>('appointments/fetchDoctors', async (_, { getState, rejectWithValue }) => {
  if (getState().appointments.doctorsLoaded) {
    return getState().appointments.doctors;
  }
  try {
    const { data } = await axios.get<Doctor[]>('http://localhost:4000/auth/doctors');
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message ?? 'Не удалось загрузить список врачей');
  }
});

export const bookAppointment = createAsyncThunk<
  Appointment,
  { doctor_id: number; date: string },
  { rejectValue: string }
>('appointments/book', async (dto, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Appointment>('http://localhost:4001/appointments', dto);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message ?? 'Не удалось создать запись');
  }
});

export const completeAppointment = createAsyncThunk<
  Appointment,
  { id: number; diagnosis: string; description: string },
  { rejectValue: string }
>('appointments/complete', async ({ id, diagnosis, description }, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch<Appointment>(
      `http://localhost:4001/appointments/${id}/complete`,
      { diagnosis, description }
    );
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message ?? 'Не удалось завершить приём');
  }
});

const slice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        s.loaded = true;
      })
      .addCase(fetchAppointments.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? 'Ошибка загрузки';
      })
      .addCase(fetchDoctors.fulfilled, (s, a) => {
        s.doctors = a.payload;
        s.doctorsLoaded = true;
      })
      .addCase(fetchDoctors.rejected, (s, a) => {
        s.error = a.payload ?? 'Ошибка загрузки врачей';
      })
      .addCase(bookAppointment.fulfilled, (s, a) => {
        s.items.push(a.payload);
      })
      .addCase(bookAppointment.rejected, (s, a) => {
        s.error = a.payload ?? 'Ошибка создания записи';
      })
      .addCase(completeAppointment.fulfilled, (s, a) => {
        const idx = s.items.findIndex((x) => x.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })
      .addCase(completeAppointment.rejected, (s, a) => {
        s.error = a.payload ?? 'Ошибка завершения приёма';
      });
  }
});

export const store = configureStore({
  reducer: { appointments: slice.reducer }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
