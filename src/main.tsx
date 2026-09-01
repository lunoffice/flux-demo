import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EsercizioProvider } from './context/EsercizioContext';
import { DemoProvider } from './context/DemoContext';
import './lib/mockApi';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoProvider>
      <EsercizioProvider>
        <App />
      </EsercizioProvider>
    </DemoProvider>
  </React.StrictMode>,
);
