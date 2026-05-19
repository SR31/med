import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { medcardStore } from './store';

const App = observer(() => {
  useEffect(() => {
    medcardStore.fetch();
  }, []);

  return (
    <div>
      <h2>Моя медицинская карта</h2>

      {medcardStore.loading && <div>Загрузка...</div>}
      {medcardStore.error && <div className="error">{medcardStore.error}</div>}
      {medcardStore.items.length === 0 && !medcardStore.loading && (
        <div>В вашей карте пока нет записей</div>
      )}

      {medcardStore.items.map((r) => (
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
});

export default App;
