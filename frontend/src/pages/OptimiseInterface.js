import { useEffect, useState } from "react";
import axios from "axios";
import {
    TextField,
    Button,
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
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

function OptimiseInterface() {
    const [formData, setFormData] = useState({
        ships: "",
        berth_capacity: "",
        berth_availability: "",
    });

    const [results, setResults] = useState(null);
    const [chartInstance, setChartInstance] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const ships = formData.ships.split(",").map(Number);
        const berth_capacity = formData.berth_capacity.split(",").map(Number);
        const berth_availability = formData.berth_availability
            .split(",")
            .map(Number);

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/optimize",
                {
                    ships,
                    berth_capacity,
                    berth_availability,
                }
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

    useEffect(() => {
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [chartInstance]);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Optimize Ship and Berth Allocation
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Ships"
                        name="ships"
                        value={formData.ships}
                        onChange={handleInputChange}
                        helperText="Enter comma separated values"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Berth Capacities"
                        name="berth_capacity"
                        value={formData.berth_capacity}
                        onChange={handleInputChange}
                        helperText="Enter comma separated values"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Berth Availability"
                        name="berth_availability"
                        value={formData.berth_availability}
                        onChange={handleInputChange}
                        helperText="Enter comma separated values (1 for available, 0 for not)"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Optimize
                    </Button>
                </Grid>
            </Grid>

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
                                            {key.split(",")[0].replace("(", "")}
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

                    <Bar
                        data={data}
                        onElementsClick={(elems) => {
                            setChartInstance(elems[0]._chart);
                        }}
                    />
                </div>
            )}
        </Container>
    );
}

export default OptimiseInterface;
