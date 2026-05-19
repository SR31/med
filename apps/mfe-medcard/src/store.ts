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

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  diagnosis: string;
  description: string;
  created_at: string;
}

interface State {
  items: MedicalRecord[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  items: [],
  loaded: false,
  loading: false,
  error: null
};

export const fetchRecords = createAsyncThunk<
  MedicalRecord[],
  void,
  { state: { medcard: State }; rejectValue: string }
>('medcard/fetch', async (_, { getState, rejectWithValue }) => {
  if (getState().medcard.loaded) {
    return getState().medcard.items;
  }
  try {
    const { data } = await axios.get<MedicalRecord[]>('http://localhost:4001/records');
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message ?? 'Не удалось загрузить медицинскую карту');
  }
});

const slice = createSlice({
  name: 'medcard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchRecords.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        s.loaded = true;
      })
      .addCase(fetchRecords.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? 'Ошибка загрузки';
      });
  }
});

export const store = configureStore({
  reducer: { medcard: slice.reducer }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
