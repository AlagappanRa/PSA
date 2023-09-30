import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const DemandForecast = () => {
  const [forecast, setForecast] = useState(null);

  const getForecast = async () => {
    try {
      const sampleData = {
        'berth_capacity': [100, 200, 300, 400, 500],
        'ship_size': [50, 60, 70, 80, 90],
        'cargo_volume': [1000, 2000, 3000, 4000, 5000],
        'equipment_availability': [10, 20, 30, 40, 50],
        'worker_availability': [5, 10, 15, 20, 25],
        'operational_costs': [1000, 2000, 3000, 4000, 5000],
        'demand': [100, 110, 120, 130, 140]
      };

      const response = await axios.post('http://localhost:5000/forecast', sampleData);
      setForecast(response.data.future_demand);
    } catch (error) {
      console.error('There was an error fetching the forecast!', error);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <Button variant="contained" color="secondary" onClick={getForecast}>
        Get Demand Forecast
      </Button>
      {forecast && (
        <Box style={{ marginTop: '20px' }}>
          <Typography variant="h6">
            Forecasted Demand: {forecast}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default DemandForecast;
