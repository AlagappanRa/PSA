import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { red, indigo, lime, purple } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: red,
    secondary: indigo,
  },
});


const DemandForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [modelSummary, setModelSummary] = useState('');

  const getForecast = async () => {
    try {
      const sampleData = {
        demand: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190]
      };

      const response = await axios.post('http://localhost:5000/forecast', sampleData);
      setForecast(response.data.future_demand[0]);
      setModelSummary(response.data.model_summary);
    } catch (error) {
      console.error('There was an error fetching the forecast!', error);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <ThemeProvider theme={theme}>
        <Button variant="contained" color="secondary" onClick={getForecast}>
          Get Demand Forecast
        </Button>
      </ThemeProvider>
      {forecast && (
        <Box style={{ marginTop: '20px' }}>
          <Typography variant="h6">
            Forecasted Demand: {forecast}
          </Typography>
          <Typography variant="body1" style={{ marginTop: '10px', whiteSpace: 'pre-line' }}>
            {modelSummary}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default DemandForecast;
