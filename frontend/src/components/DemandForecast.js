import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
}));

const ForecastPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#f0f0f0',
}));

const DemandForecast = () => {
  const [forecast, setForecast] = useState(null);
  const [formData, setFormData] = useState({
    berth_capacity: '',
    ship_size: '',
    cargo_volume: '',
    equipment_availability: '',
    worker_availability: '',
    operational_costs: '',
    demand: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const getForecast = async () => {
    try {
      const response = await axios.post('http://localhost:5000/forecast', formData);
      setForecast(response.data.future_demand);
    } catch (error) {
      console.error('There was an error fetching the forecast!', error);
    }
  };

    return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledPaper>
          <TextField 
            type="number"
            name="berth_capacity"
            label="Berth Capacity"
            value={formData.berth_capacity}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
            type="number"
            name="ship_size"
            label="Ship Size"
            value={formData.ship_size}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
            type="number"
            name="cargo_volume"
            label="Cargo Volume"
            value={formData.cargo_volume}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
            type="number"
            name="equipment_availability"
            label="Equipment Availability"
            value={formData.equipment_availability}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
            type="number"
            name="worker_availability"
            label="Worker Availability"
            value={formData.worker_availability}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
            type="number"
            name="operational_costs"
            label="Operational Costs"
            value={formData.operational_costs}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
            type="number"
            name="weather_conditions_sunny"
            label="Sunny"
            value={formData.weather_conditions_sunny}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField 
              type="number"
              name="weather_conditions_rainy"
              label="Rainy"
              value={formData.weather_conditions_rainy}
              onChange={handleInputChange}
              fullWidth
          />
          <TextField 
              type="number"
              name="weather_conditions_cloudy"
              label="Cloudy"
              value={formData.weather_conditions_cloudy}
              onChange={handleInputChange}
              fullWidth
          />
          <TextField 
            type="number"
            name="demand"
            label="Demand"
            value={formData.demand}
            onChange={handleInputChange}
            fullWidth
          />
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={getForecast} 
            fullWidth
          >
            Get Demand Forecast
          </Button>
        </StyledPaper>
      </Grid>
      {forecast && (
        <Grid item xs={12}>
          <ForecastPaper>
            <Typography variant="h6">
              Forecasted Demand: {forecast}
            </Typography>
          </ForecastPaper>
        </Grid>
      )}
    </Grid>
  );
};

export default DemandForecast;