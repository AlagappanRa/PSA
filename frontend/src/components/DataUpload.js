import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { amber, indigo } from "@mui/material/colors";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";

const theme = createTheme({
    palette: {
        primary: amber,
        secondary: indigo,
    },
});

const DataUpload = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const onFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const upload = async () => {
        if (!onUpload) {
            // Check if onUpload prop is provided
            const formData = new FormData();
            formData.append("file", file);

            try {
                await axios.post(
                    `${process.env.REACT_APP_SERVER_URL}/upload`,
                    formData
                );
                // Handle successful upload, e.g., set a success message or do something else
            } catch (error) {
                console.error("There was an error uploading the file!", error);
                setError("There was an error uploading the file!");
            }
        } else if (file) {
            onUpload(file); // If onUpload prop is provided and file is selected, call onUpload function
        }
    };

    const current = new Date();
    const date = `${current.getDate()}/${
        current.getMonth() + 1
    }/${current.getFullYear()} ${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}`;

    return (
        <Card>
            <CardHeader title="Data Upload" subheader={date} align="center" />
            <CardContent>
                <ThemeProvider theme={theme}>
                    <Grid
                        container
                        spacing={2}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Grid item xs={12}>
                            <input
                                accept="*/*"
                                id="contained-button-file"
                                type="file"
                                hidden
                                onChange={onFileChange}
                            />
                            <label htmlFor="contained-button-file">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                >
                                    Select File
                                </Button>
                            </label>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={upload}
                                disabled={!file}
                            >
                                Upload Data
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                            >
                                Upload your data file here!
                            </Typography>
                        </Grid>
                    </Grid>
                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}
                </ThemeProvider>
            </CardContent>
        </Card>
    );
};

export default DataUpload;
