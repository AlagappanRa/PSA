import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
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

const DemandForecast = ({ getForecast, forecast }) => {
    const [formData, setFormData] = useState({
        berth_capacity: "400",
        ship_size: "80",
        cargo_volume: "4000",
        equipment_availability: "40",
        worker_availability: "21",
        operational_costs: "4000",
        tide_levels: "3.0",
        ship_arrival_delays: "40",
        demand: "160",
    });

    const handleInputChange = (e) => {
        let { name, value, type } = e.target;

        // Conditionally check for number fields
        if (type === "number" && +value < 0) {
            value = 0;
        }

        setFormData((prevState) => ({ ...prevState, [name]: value }));
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
                        onClick={fetchForecast}
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
