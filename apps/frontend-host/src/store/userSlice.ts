import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
    if (error.response?.status === 401 && localStorage.getItem("auth")) {
      localStorage.removeItem("auth");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "PATIENT" | "DOCTOR";
}

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const loadInitial = (): UserState => {
  const saved = localStorage.getItem("auth");
  if (saved) {
    try {
      const p = JSON.parse(saved);
      return { user: p.user, token: p.token, loading: false, error: null };
    } catch {}
  }
  return { user: null, token: null, loading: false, error: null };
};

export const login = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("user/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post("http://localhost:4000/auth/login", {
      email,
      password,
    });
    localStorage.setItem("auth", JSON.stringify(data));
    return data;
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message ?? "Ошибка соединения с сервером",
    );
  }
});

export const register = createAsyncThunk<
  void,
  {
    email: string;
    password: string;
    full_name: string;
    role: "PATIENT" | "DOCTOR";
  },
  { rejectValue: string }
>("user/register", async (dto, { dispatch, rejectWithValue }) => {
  try {
    await axios.post("http://localhost:4000/auth/register", dto);
    await dispatch(login({ email: dto.email, password: dto.password }));
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message ?? "Не удалось зарегистрироваться",
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: loadInitial(),
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("auth");
      window.location.reload();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка входа";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка регистрации";
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
