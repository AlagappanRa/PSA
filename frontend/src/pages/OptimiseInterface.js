import { useState } from "react";
import axios from "axios";
import {
    Typography,
    Container,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    Box,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import DataUpload from "../components/DataUpload";

function OptimiseInterface() {
    const [results, setResults] = useState(null);

    const onUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/optimize",
                formData
            );
            setResults(response.data);
        } catch (error) {
            console.error("There was an error!", error);
        }
    };

    const data = {
        labels: [
            "Total Cargo Assigned",
            "Total Time Taken",
            "Average Ratio",
            "Optimized by Percentage",
        ],
        datasets: [
            {
                label: "Optimization Results",
                data: results
                    ? [
                          results.total_cargo_assigned,
                          results.total_time_taken,
                          results.average_ratio,
                          results.optimized_by_percentage,
                      ]
                    : [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom align="center">
                        Optimize Ship and Berth Allocation
                    </Typography>

                    <Box mt={3}>
                        <Grid container spacing={3}>
                            <DataUpload onUpload={onUpload} />
                        </Grid>
                    </Box>

                    {results && (
                        <div style={{ marginTop: "20px" }}>
                            <Typography variant="h6" gutterBottom>
                                Optimization Results:
                            </Typography>

                            <TableContainer
                                component={Paper}
                                style={{ marginBottom: "20px" }}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ship Index</TableCell>
                                            <TableCell>Berth Index</TableCell>
                                            <TableCell>Assignment</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(
                                            results.optimized_assignment
                                        ).map(([key, value], index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {key
                                                        .split(",")[0]
                                                        .replace("(", "")}
                                                </TableCell>
                                                <TableCell>
                                                    {key
                                                        .split(",")[1]
                                                        .replace(")", "")
                                                        .trim()}
                                                </TableCell>
                                                <TableCell>{value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Bar data={data} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

export default OptimiseInterface;
