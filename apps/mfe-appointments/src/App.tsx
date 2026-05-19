import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import {
  store,
  useAppDispatch,
  useAppSelector,
  fetchAppointments,
  fetchDoctors,
  bookAppointment,
  completeAppointment,
  Appointment
} from './store';

const getCurrentUser = (): { id: number; role: 'PATIENT' | 'DOCTOR' } | null => {
  const saved = localStorage.getItem('auth');
  if (!saved) return null;
  try {
    return JSON.parse(saved).user;
  } catch {
    return null;
  }
};

const PatientView = () => {
  const dispatch = useAppDispatch();
  const { items, doctors, doctorsLoaded, loading, error } = useAppSelector((s) => s.appointments);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');

  const submit = () => {
    if (!doctorId || !date) return;
    dispatch(bookAppointment({ doctor_id: Number(doctorId), date }));
    setDoctorId('');
    setDate('');
  };

  const doctorName = (id: number) => {
    const d = doctors.find((x) => x.id === id);
    return d ? d.full_name : `Врач #${id}`;
  };

  return (
    <div>
      <h2>Запись на приём</h2>

      <div className="card form-card">
        <h3>Новая запись</h3>
        <div className="form-row">
          <label className="form-field">
            <span className="form-label">Врач</span>
            <select
              className="select-pretty"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">— выберите врача —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.email})
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">Дата и время</span>
            <input
              className="input-pretty"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <button className="btn-primary" onClick={submit} disabled={!doctorId || !date}>
            Записаться
          </button>
        </div>
        {doctors.length === 0 && doctorsLoaded && (
          <div className="hint">В системе пока нет зарегистрированных врачей</div>
        )}
      </div>

      <h3>Мои записи</h3>
      {loading && <div>Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      {items.length === 0 && !loading && <div>Записей пока нет</div>}
      {items.map((a) => (
        <div key={a.id} className="card">
          <div>
            <strong>Врач:</strong> {doctorName(a.doctor_id)}
          </div>
          <div>
            <strong>Дата:</strong> {new Date(a.date).toLocaleString('ru-RU')}
          </div>
          <div>
            <strong>Статус:</strong> {a.status}
          </div>
        </div>
      ))}
    </div>
  );
};

const CompleteForm = ({ appointment }: { appointment: Appointment }) => {
  const dispatch = useAppDispatch();
  const [diagnosis, setDiagnosis] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!diagnosis.trim()) return;
    setBusy(true);
    const res = await dispatch(
      completeAppointment({ id: appointment.id, diagnosis, description })
    );
    setBusy(false);
    if (completeAppointment.fulfilled.match(res)) {
      setDiagnosis('');
      setDescription('');
    }
  };

  return (
    <div className="form-row" style={{ marginTop: 10 }}>
      <label className="form-field">
        <span className="form-label">Диагноз</span>
        <input
          className="input-pretty"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          placeholder="Например: ОРВИ"
        />
      </label>
      <label className="form-field">
        <span className="form-label">Описание / назначения</span>
        <input
          className="input-pretty"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Например: постельный режим, обильное питьё"
        />
      </label>
      <button
        className="btn-primary"
        onClick={submit}
        disabled={busy || !diagnosis.trim()}
      >
        {busy ? 'Сохранение...' : 'Завершить приём'}
      </button>
    </div>
  );
};

const DoctorView = () => {
  const { items, loading, error } = useAppSelector((s) => s.appointments);
  return (
    <div>
      <h2>Мои приёмы</h2>
      {loading && <div>Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      {items.length === 0 && !loading && <div>Записей пока нет</div>}
      {items.map((a) => (
        <div key={a.id} className="card">
          <div>
            <strong>Пациент:</strong> #{a.patient_id}
          </div>
          <div>
            <strong>Дата:</strong> {new Date(a.date).toLocaleString('ru-RU')}
          </div>
          <div>
            <strong>Статус:</strong> {a.status}
          </div>
          {a.status !== 'COMPLETED' && <CompleteForm appointment={a} />}
        </div>
      ))}
    </div>
  );
};

const Inner = () => {
  const dispatch = useAppDispatch();
  const user = getCurrentUser();

  useEffect(() => {
    dispatch(fetchAppointments());
    if (user?.role === 'PATIENT') {
      dispatch(fetchDoctors());
    }
  }, []);

  if (!user) return null;
  return user.role === 'DOCTOR' ? <DoctorView /> : <PatientView />;
};

const App = () => (
  <Provider store={store}>
    <Inner />
  </Provider>
);

export default App;
