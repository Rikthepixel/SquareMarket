import React from 'react';
import ReactDOM from 'react-dom/client';

import Routes from './Routes';

import "@/lib/auth/init"
import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
);
