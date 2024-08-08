import React from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useState } from "react";

const TrainModel = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const trainModel = async () => {
        setLoading(true);
        setError(""); // Clear previous error
        setSuccess(""); // Clear previous success message
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/train`,
                {}
            );
            console.log(response.data);
            setSuccess("Model trained successfully!");
        } catch (error) {
            console.error("There was an error training the model!", error);
            setError("There was an error training the model!");
        } finally {
            setLoading(false);  // Set loading to false when the request finishes
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
                disabled={loading} // Disable button when loading
                sx={{ width: "100%", height: "100%" }}
            >
                Train Model
            </Button>
            {error && (
                <Alert severity="error" sx={{ width: "100%", marginTop: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ width: "100%", marginTop: 2 }}>
                    {success}
                </Alert>
            )}
        </Box>
    );
};

export default TrainModel;
