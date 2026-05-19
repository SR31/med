import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { appointmentsStore, Appointment } from './store';

const getCurrentUser = (): { id: number; role: 'PATIENT' | 'DOCTOR' } | null => {
  const saved = localStorage.getItem('auth');
  if (!saved) return null;
  try {
    return JSON.parse(saved).user;
  } catch {
    return null;
  }
};

const PatientView = observer(() => {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');

  const submit = () => {
    if (!doctorId || !date) return;
    appointmentsStore.book(Number(doctorId), date);
    setDoctorId('');
    setDate('');
  };

  const doctorName = (id: number) => {
    const d = appointmentsStore.doctors.find((x) => x.id === id);
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
              {appointmentsStore.doctors.map((d) => (
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
        {appointmentsStore.doctors.length === 0 && appointmentsStore.doctorsLoaded && (
          <div className="hint">В системе пока нет зарегистрированных врачей</div>
        )}
      </div>

      <h3>Мои записи</h3>
      {appointmentsStore.loading && <div>Загрузка...</div>}
      {appointmentsStore.error && <div className="error">{appointmentsStore.error}</div>}
      {appointmentsStore.items.length === 0 && !appointmentsStore.loading && (
        <div>Записей пока нет</div>
      )}
      {appointmentsStore.items.map((a) => (
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
});

const CompleteForm = observer(({ appointment }: { appointment: Appointment }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!diagnosis.trim()) return;
    setBusy(true);
    const ok = await appointmentsStore.complete(appointment.id, diagnosis, description);
    setBusy(false);
    if (ok) {
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
});

const DoctorView = observer(() => {
  return (
    <div>
      <h2>Мои приёмы</h2>
      {appointmentsStore.loading && <div>Загрузка...</div>}
      {appointmentsStore.error && <div className="error">{appointmentsStore.error}</div>}
      {appointmentsStore.items.length === 0 && !appointmentsStore.loading && (
        <div>Записей пока нет</div>
      )}
      {appointmentsStore.items.map((a) => (
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
});

const App = observer(() => {
  const user = getCurrentUser();

  useEffect(() => {
    appointmentsStore.fetch();
    if (user?.role === 'PATIENT') {
      appointmentsStore.fetchDoctors();
    }
  }, []);

  if (!user) return null;
  return user.role === 'DOCTOR' ? <DoctorView /> : <PatientView />;
});

export default App;
