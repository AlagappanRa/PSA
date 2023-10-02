import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import ForecastCharts from "./ForecastCharts";  // Import ForecastCharts here

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
        "berth_capacity": 325,
        "ship_size": 75.23,
        "cargo_volume": 4500.87,
        "equipment_availability": 30.75,
        "worker_availability": 18,
        "operational_costs": 3600.52,
        "tide_levels": 2.9,
        "ship_arrival_delays": 25,
        "demand": 160
    });

    const handleInputChange = (e) => {
        let { name, value, type } = e.target;

        // Conditionally check for number fields
        if (type === "number" && +value < 0) {
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
            setForecast(response.data);
        } catch (error) {
            console.error("There was an error fetching the forecast!", error);
        }
    };

    const fetchForecast = () => {
        getForecast(formData);
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
                        name="tide_levels"
                        label="Tide Level"
                        value={formData.tide_levels}
                        onChange={handleInputChange}
                        fullWidth
                    />

                    <TextField
                        type="number"
                        name="ship_arrival_delays"
                        label="Number of ships delayed"
                        value={formData.ship_arrival_delays}
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
                            Forecasted Demand: {forecast.future_demand}
                        </Typography>
                    </ForecastPaper>
                    <ForecastCharts forecast={forecast} /> 
                </Grid>
            )}
        </Grid>
    );
};

export default DemandForecast;
