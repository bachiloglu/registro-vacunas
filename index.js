import React from 'react';
import ReactDOM from 'react-dom/client'; // Asegúrate de que esta ruta es correcta según tus dependencias
import App from './app.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);