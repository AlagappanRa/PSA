import React from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useState } from "react";

const TrainModel = () => {
    const [error, setError] = useState("");

    const trainModel = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/train`,
                {}
            );
            console.log(response.data);
        } catch (error) {
            console.error("There was an error training the model!", error);
            setError("There was an error training the model!");
        }
    };

    return (
        <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
        }}>
            <Button
                variant="contained"
                color="primary"
                onClick={trainModel}
                sx={{ width: "100%", height: "100%" }}
            >
                Train Model
            </Button>
            {error && (
                <Alert severity="error" sx={{ width: "100%", marginTop: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default TrainModel;
