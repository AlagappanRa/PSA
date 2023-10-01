import React, { useState } from 'react';
import axios from 'axios';
import './ParentComponent.css';

const MainGamePage = ({ numShips, numBerths }) => {
  const [shipData, setShipData] = useState(Array(numShips).fill({ name: '', cargo: '' }));
  const [berthData, setBerthData] = useState(Array(numBerths).fill({ capacity: '', available: true }));

  const handleShipChange = (index, field, value) => {
    const newShipData = [...shipData];
    newShipData[index][field] = value;
    setShipData(newShipData);
  };

  const handleBerthChange = (index, field, value) => {
    const newBerthData = [...berthData];
    newBerthData[index][field] = value;
    setBerthData(newBerthData);
  };

  const optimize = async () => {
    // Call the backend API to run the optimization
    // Send shipData and berthData to the backend
    try {
      const response = await axios.post('http://localhost:5000/optimize', { shipData, berthData });
      console.log(response.data); // Handle the response accordingly
    } catch (error) {
      console.error('There was an error optimizing!', error);
    }
  };

  return (
    <div>
      <div>
        {shipData.map((ship, index) => (
          <div key={index} className={`ship ${assignments.some(a => a.shipName === ship.name) ? 'assigned' : ''}`}>
            <input
              placeholder="Ship Name"
              value={ship.name}
              onChange={(e) => handleShipChange(index, 'name', e.target.value)}
            />
            <input
              type="number"
              placeholder="Cargo"
              value={ship.cargo}
              onChange={(e) => handleShipChange(index, 'cargo', e.target.value)}
            />
          </div>
        ))}
      </div>
      <div>
        {berthData.map((berth, index) => (
          <div key={index}>
            <input
              type="number"
              placeholder="Capacity"
              value={berth.capacity}
              onChange={(e) => handleBerthChange(index, 'capacity', e.target.value)}
            />
            <input
              type="checkbox"
              checked={berth.available}
              onChange={(e) => handleBerthChange(index, 'available', e.target.checked)}
            />
          </div>
        ))}
      </div>
      <button onClick={optimize}>Optimize</button>
    </div>
  );
};

export default MainGamePage;
