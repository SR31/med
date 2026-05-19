import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './styles.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}
