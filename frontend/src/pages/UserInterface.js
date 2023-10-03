import React from 'react';
import DataUpload from "../components/DataUpload";
import DemandForecast from "../components/DemandForecast";
import TrainModel from "../components/TrainModel";
import { Card, CardContent, Typography, Grid } from "@mui/material";

const UserInterface = () => {
    return (
        <div className="min-h-screen bg-primary p-4">
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom align="center">
                                Upload Your Historical Data Here
                            </Typography>
                            <DataUpload sampleData={"demand_forecast"}/>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom align="center">
                                Train Your Model
                            </Typography>
                            <TrainModel />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card elevation={3} style={{ height: 'auto', minHeight: '500px' }}> {/* Added style here */}
                        <CardContent>
                            <DemandForecast />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default UserInterface;
