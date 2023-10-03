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
import { Doughnut } from "react-chartjs-2";

function OptimiseInterface() {
    const [results, setResults] = useState(null);

    const onUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/optimize`,
                formData, 
                { 
                    headers: {'Content-Type': 'multipart/form-data'}
                }
            );
            console.log(response.data)
            setResults(response.data);
        } catch (error) {
            console.error("There was an error!", error);
        }
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

        const allocations = new Array(10).fill("No berth allocated");

        Object.entries(results.optimized_assignment).forEach(([key, value]) => {
            if (value === 1) {
                const [shipIndex, berthIndex] = key.split(",");
                allocations[parseInt(shipIndex)] = `Berth ${berthIndex.trim()}`;
            }
        });

        return allocations;
    };

    const allocations = getAllocations();

    return (
        <Box sx={{ height: '100vh', width: '100%' }}>
            <Container maxWidth={false}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" gutterBottom align="center">
                            Optimize Ship and Berth Allocation
                        </Typography>

                        <Box mt={5}>
                            <Grid item container spacing={3} direction="column">
                                <Grid item xs={12} sm={6}>
                                    <DataUpload onUpload={onUpload} sampleData={"optimise"}/>
                                </Grid>
                            </Grid>
                        </Box>

                    {results && (
                        <Box mt={3}>
                            <Typography variant="h6" gutterBottom>
                                Optimized Berth Allocation:
                            </Typography>
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ship Index</TableCell>
                                            <TableCell>Allocation</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allocations.map((allocation, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index}</TableCell>
                                                <TableCell>{allocation}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

      <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Berth Utilization:
                                    </Typography>
                                    <Box sx={{ mb: 3 }}>
                                        <Doughnut data={pieData} />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Other Metrics:
                                    </Typography>
                                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Total Cargo Assigned</TableCell>
                                                    <TableCell>{results.total_cargo_assigned}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Total Time Taken</TableCell>
                                                    <TableCell>{results.total_time_taken}</TableCell>
                                                </TableRow>
                                                {/* <TableRow>
                                                    <TableCell>Efficiency Gain</TableCell>
                                                    <TableCell>
                                                        <CircularProgress 
                                                            variant="determinate"
                                                            value={results.efficiency_gain} 
                                                        />
                                                    </TableCell>
                                                </TableRow> */}
                                                <TableRow>
                                                    <TableCell>Cargo to Time Ratio</TableCell>
                                                    <TableCell>
                                                        {results.cargo_to_time_ratio.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                                {/* Add more metrics here as needed */}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    </Box>
    );
}

export default OptimiseInterface;
