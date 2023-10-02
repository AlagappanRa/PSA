import React from 'react';
import DataUpload from "../components/DataUpload";
import DemandForecast from "../components/DemandForecast";
import TrainModel from "../components/TrainModel";
import { Card, CardContent, Grid } from "@mui/material";

const UserInterface = () => {
    return (
        <div className="min-h-screen bg-primary p-4">
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardContent>
                            <DataUpload />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardContent>
                            <TrainModel />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card elevation={3}>
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
