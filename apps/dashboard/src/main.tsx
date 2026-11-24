import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { HazardProvider } from './context/HazardContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HazardProvider>
      <App />
    </HazardProvider>
  </React.StrictMode>
);
