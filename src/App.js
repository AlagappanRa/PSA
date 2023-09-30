import React from 'react';
import './App.css';
import DataUpload from './components/DataUpload';
import DemandForecast from './components/DemandForecast';
import TrainModel from './components/TrainModel'; // Import the TrainModel component
import OptimizeResources from './components/OptimizeResources'; // Import the OptimizeResources component

function App() {
  return (
    <div className="App">
      <div className='dataUpload'>
      <DataUpload />
      </div>
      {/* You can add more components as needed */}
    </div>
  );
}

export default App;
