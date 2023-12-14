import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';

import Routes from './Routes';
import theme from './theme';

import '@/lib/auth/init';

import '@mantine/core/styles.css';
import '@/styles/index.css';
import '@mantine/carousel/styles.css';
import MainLayout from './layouts/MainLayout';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <MainLayout>
        <Routes />
      </MainLayout>
    </MantineProvider>
  </React.StrictMode>,
);
