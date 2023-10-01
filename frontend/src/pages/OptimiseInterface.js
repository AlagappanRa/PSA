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
    CircularProgress,
} from "@mui/material";
import "chart.js/auto";
import DataUpload from "../components/DataUpload";
import { Bar, Doughnut, GaugeChart } from "react-chartjs-2";

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

    const barData = {
        labels: ["Total Cargo Assigned", "Total Time Taken"],
        datasets: [
            {
                label: "",
                data: results
                    ? [
                          results.total_cargo_assigned,
                          results.total_time_taken,
                          //   results.average_ratio,
                          //   results.optimized_by_percentage,
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

    const pieData = {
        labels: ["Utilized Berths", "Unutilized Berths"],
        datasets: [
            {
                data: results
                    ? [results.utilization_rate, 100 - results.utilization_rate]
                    : [],
                backgroundColor: ["#36A2EB", "#FFCE56"],
                hoverBackgroundColor: ["#36A2EB", "#FFCE56"],
            },
        ],
    };

    const getAllocations = () => {
        if (!results) return [];

        const allocations = new Array(10).fill("No berth allocated"); // Initialize an array with "No berth allocated" as default values

        Object.entries(results.optimized_assignment).forEach(([key, value]) => {
            if (value === 1) {
                const [shipIndex, berthIndex] = key.split(",");
                allocations[parseInt(shipIndex)] = `Berth ${berthIndex.trim()}`; // If a berth is allocated, update the value in the array
            }
        });

        return allocations;
    };

    const allocations = getAllocations();

    return (
        <Container>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom align="center">
                        Optimize Ship and Berth Allocation
                    </Typography>

                    <Box mt={5}>
                        <Grid item container spacing={3} direction="column">
                            <Grid item xs={12} sm={6}>
                                <DataUpload onUpload={onUpload} />
                            </Grid>
                        </Grid>
                    </Box>

                    {results && (
                        <div style={{ marginTop: "20px" }}>
                            <Typography variant="h6" gutterBottom>
                                Optimized Berth Allocation:
                            </Typography>
                            <TableContainer
                                component={Paper}
                                style={{ marginBottom: "20px" }}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ship Index</TableCell>
                                            <TableCell>
                                                Allocation
                                            </TableCell>{" "}
                                            {/* Updated column name */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allocations.map(
                                            (allocation, index) => (
                                                // Looping through allocations array to create the table rows
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {index}
                                                    </TableCell>
                                                    <TableCell>
                                                        {allocation}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Bar
                                data={barData}
                                options={{ responsive: true }}
                            />
                            <Typography
                                variant="h6"
                                gutterBottom
                                style={{ marginTop: "20px" }}
                            >
                                Berth Utilization:
                            </Typography>
                            <Doughnut
                                data={pieData}
                                options={{ responsive: true }}
                            />
                            <Typography
                                variant="h6"
                                gutterBottom
                                style={{ marginTop: "20px" }}
                            >
                                Efficiency Gain:
                            </Typography>
                            <CircularProgress
                                variant="determinate"
                                value={results.efficiency_gain}
                            />{" "}
                            {/* A CircularProgress component to show efficiency gain */}
                            <Typography
                                variant="h6"
                                gutterBottom
                                style={{ marginTop: "20px" }}
                            >
                                Cargo to Time Ratio:
                            </Typography>
                            <Typography variant="body2">
                                {results.cargo_to_time_ratio.toFixed(2)}{" "}
                                {/* Adjust the decimal places as needed */}
                            </Typography>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

export default OptimiseInterface;
