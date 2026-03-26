import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { StoreProvider } from './context/StoreContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <AdminProvider>
        <App />
      </AdminProvider>
    </StoreProvider>
  </React.StrictMode>
);
