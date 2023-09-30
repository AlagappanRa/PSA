// src/components/DataUpload.js

import React, { useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";

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

    return (
        <div style={{ marginBottom: "20px" }}>
            <input type="file" onChange={onFileChange} />
            <Button
                variant="contained"
                color="primary"
                onClick={onUpload}
                disabled={!file}
            >
                Upload Data
            </Button>
        </div>
    );
};

export default DataUpload;
