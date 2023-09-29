import React from 'react';
import './App.css';
import DataUpload from './components/DataUpload';
import DemandForecast from './components/DemandForecast';
import TrainModel from './components/TrainModel'; // Import the TrainModel component
import OptimizeResources from './components/OptimizeResources'; // Import the OptimizeResources component

function App() {
  return (
    <div className="App">
      <h1>Port Optimization System</h1>
      <DataUpload />
      <TrainModel /> {/* Add the TrainModel component to the component tree */}
      <OptimizeResources /> {/* Add the OptimizeResources component to the component tree */}
      <DemandForecast />
      {/* You can add more components as needed */}
    </div>
  );
}

export default App;
