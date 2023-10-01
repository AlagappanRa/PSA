import React, { useState } from "react";
import axios from "axios";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(() => ({
    padding: 2,
    textAlign: "center",
    color: "#12263A",
}));

const StyledButton = styled(Button)(() => ({
    marginTop: 2,
    width: "100%",
}));

const ForecastPaper = styled(Paper)(() => ({
    marginTop: 2,
    padding: 2,
    backgroundColor: "#f0f0f0",
}));

const DemandForecast = () => {
    const [forecast, setForecast] = useState(null);
    const [formData, setFormData] = useState({
        berth_capacity: "",
        ship_size: "",
        cargo_volume: "",
        equipment_availability: "",
        worker_availability: "",
        operational_costs: "",
        demand: "",
    });

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (value < 0) {
            value = 0;
        }
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const getForecast = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/forecast",
                formData
            );
            setForecast(response.data.future_demand);
        } catch (error) {
            console.error("There was an error fetching the forecast!", error);
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
                    <FormControl fullWidth>
                        <InputLabel>Weather Conditions</InputLabel>
                        <Select
                            name="weather_conditions"
                            value={formData.weather_conditions}
                            onChange={handleInputChange}
                        >
                            <MenuItem value="sunny">Sunny</MenuItem>
                            <MenuItem value="rainy">Rainy</MenuItem>
                            <MenuItem value="cloudy">Cloudy</MenuItem>
                        </Select>
                    </FormControl>
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
