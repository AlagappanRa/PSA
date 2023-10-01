import DataUpload from "../components/DataUpload";
import DemandForecast from "../components/DemandForecast";
import TrainModel from "../components/TrainModel";
import ForecastCharts from "../components/ForecastCharts";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import axios from "axios";
import { useState } from "react";

const UserInterface = () => {
    const [forecast, setForecast] = useState(null);
    
    const getForecast = async (formData) => {
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
        <div className="min-h-screen bg-primary p-4">
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Grid
                                container
                                spacing={3}
                                direction="column"
                                alignItems="center"
                            >
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        align="center"
                                    >
                                        Data Upload and Model Training
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    spacing={3}
                                    justifyContent="center"
                                >
                                    <Grid item xs={12} sm={6}>
                                        <DataUpload />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TrainModel />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                gutterBottom
                                align="center"
                            >
                                Input today's data to get a demand forecast for
                                tomorrow!
                            </Typography>
                            <DemandForecast 
                                getForecast={getForecast} 
                                forecast={forecast} 
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default UserInterface;
