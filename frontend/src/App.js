// src/App.js

import React from 'react';
import './App.css';
import DataUpload from './components/DataUpload.js';
import DemandForecast from './components/DemandForecast.js';

function App() {
  return (
    <div className="App">
      <h1>Port Optimization System</h1>
      <DataUpload />
      <DemandForecast />
      {/* You can add more components as needed */}
    </div>
  );
}

export default App;
