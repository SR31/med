import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector, fetchRecords } from './store';

const Inner = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.medcard);

  useEffect(() => {
    dispatch(fetchRecords());
  }, []);

  return (
    <div>
      <h2>Моя медицинская карта</h2>

      {loading && <div>Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      {items.length === 0 && !loading && <div>В вашей карте пока нет записей</div>}

      {items.map((r) => (
        <div key={r.id} className="card">
          <div>
            <strong>Диагноз:</strong> {r.diagnosis}
          </div>
          <div>
            <strong>Описание:</strong> {r.description || '—'}
          </div>
          <div>
            <strong>Врач:</strong> #{r.doctor_id}
          </div>
          <div>
            <strong>Дата:</strong> {new Date(r.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      ))}
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <Inner />
  </Provider>
);

export default App;
