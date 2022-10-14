import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Room from './features/Home/Room';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Room/>
    {/* <Search /> */}
  </React.StrictMode>
);
