// src/components/DataUpload.js

import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { amber, indigo, lime, purple } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import DemandForecast from "./DemandForecast";

const theme = createTheme({
    palette: {
        primary: amber,
        secondary: indigo,
    },
});

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    }),
}));

const DataUpload = () => {
    const [file, setFile] = useState(null);

    const onFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const onUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "http://localhost:5000/upload",
                formData
            );
            console.log(response.data);
        } catch (error) {
            console.error("There was an error uploading the file!", error);
        }
    };

    const current = new Date();
    const date = `${current.getDate()}/${
        current.getMonth() + 1
    }/${current.getFullYear()} ${current.getHours()}${":"}${current.getMinutes()}${":"}${current.getSeconds()}`;
    return (
        <Card sx={{ maxWidth: 345, border: "10px grey solid" }}>
            <CardHeader
                action={<IconButton aria-label="settings"></IconButton>}
                title="Port Optimization System"
                subheader={date}
            />
            <CardContent>
                <ThemeProvider theme={theme}>
                    <div style={{ marginBottom: "50px" }}>
                        <div style={{ marginLeft: "50px" }}>
                            <input type="file" onChange={onFileChange} />
                        </div>
                        <div style={{ marginTop: "50px" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={onUpload}
                                disabled={!file}
                            >
                                Upload Data
                            </Button>
                        </div>
                    </div>
                </ThemeProvider>
                <DemandForecast />
                <Typography variant="body2" color="text.secondary">
                    Upload data here and get a customised forecaset on how much
                    demand PSA should expect!
                </Typography>
            </CardContent>
        </Card>
    );
};

export default DataUpload;
