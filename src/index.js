import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { configureStore } from './store/store';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './Auth/AuthContext';
const queryClient = new QueryClient();



/**
 * IMPORTANT:
 * Tu veux que l'app soit TOUJOURS servie sous /boutique_banconi (dev + prod),
 * comme ta config Nginx qui redirige / -> /boutique_banconi.
 *
 * Donc:
 * - basename fixe = '/boutique_banconi'
 * - si on arrive sur '/', on redirige automatiquement vers '/boutique_banconi'
 */
// const basename = '/boutique_banconi';

// // Redirection automatique (dev + prod) pour éviter “page blanche” si on ouvre /
// if (
//   typeof window !== 'undefined' &&
//   !window.location.pathname.startsWith(basename)
// ) {
//   const nextPath = `${basename}${window.location.pathname}`.replace(
//     /\/+/g,
//     '/'
//   );
//   window.history.replaceState(null, '', `${nextPath}${window.location.search}${window.location.hash}`);
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={configureStore({})}>
    <React.Fragment>
      <BrowserRouter basename={"/boutique_banconi"}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.Fragment>
  </Provider>
);
reportWebVitals();
// ServiceWorker.register();
