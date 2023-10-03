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
import ForecastCharts from "./ForecastCharts";

const StyledPaper = styled(Paper)(() => ({
    padding: 2,
    textAlign: "center",
    color: "#12263A",
}));

const DemandForecast = () => {
    const [forecast, setForecast] = useState(null);
    const [formData, setFormData] = useState({
        "berth_capacity": "",
        "ship_size": "",
        "cargo_volume": "",
        "equipment_availability": "",
        "worker_availability": "",
        "operational_costs": "",
        "tide_levels": "",
        "ship_arrival_delays": "",
        "demand": ""
    });

    const sampleData = {
        "berth_capacity": 325,
        "ship_size": 75.23,
        "cargo_volume": 4500.87,
        "equipment_availability": 30.75,
        "worker_availability": 18,
        "operational_costs": 3600.52,
        "tide_levels": 2.9,
        "ship_arrival_delays": 25,
        "demand": 160
    };

    const handleInputChange = (e) => {
        let { name, value, type } = e.target;

        if (type === "number" && +value < 0) {
            value = 0;
        }

        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const useSampleData = () => {
        setFormData(sampleData);
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

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <StyledPaper>
                    <Typography variant="h6">
                        Input today's information
                    </Typography>
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="berth_capacity"
                        label="Berth Capacity"
                        value={formData.berth_capacity}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="ship_size"
                        label="Ship Size"
                        value={formData.ship_size}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="cargo_volume"
                        label="Cargo Volume"
                        value={formData.cargo_volume}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="equipment_availability"
                        label="Equipment Availability"
                        value={formData.equipment_availability}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="worker_availability"
                        label="Worker Availability"
                        value={formData.worker_availability}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="operational_costs"
                        label="Operational Costs"
                        value={formData.operational_costs}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="tide_levels"
                        label="Tide Level"
                        value={formData.tide_levels}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="ship_arrival_delays"
                        label="Number of ships delayed"
                        value={formData.ship_arrival_delays}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <TextField
                        style={{ marginBottom: '20px' }}
                        type="number"
                        name="demand"
                        label="Demand"
                        value={formData.demand}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={useSampleData}
                        fullWidth
                    >
                        Use Sample Data
                    </Button>
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
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" align="center">
                        Get tomorrow's demand forecast
                    </Typography>
                    <ForecastCharts forecast={forecast} />
                </Grid>
            )}
        </Grid>
    );
};

export default DemandForecast;
