import { Box } from '@mui/material';
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#FFBB28'];

const ForecastCharts = ({ forecast }) => {
    const { future_demand, historical_demand, comparison, feature_importances } = forecast;

    const data = historical_demand.map((demand, index) => ({
        name: `Day ${index + 1}`,
        demand,
    }));

    data.push({ name: 'Future', demand: future_demand[0] });

    const featureData = feature_importances ? Object.keys(feature_importances).map((key, index) => ({
        name: key,
        value: feature_importances[key]
    })) : [];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <table style={{ marginBottom: '20px', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>Forecasted Demand</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{future_demand[0].toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>Increase in Demand</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{comparison.increase_in_demand[0].toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>Percentage Increase</td>
                            <td style={{ padding: '10px', border: '1px solid #ccc' }}>{comparison.percentage_increase[0].toFixed(2)}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <ResponsiveContainer width='100%' height={300}>
                <LineChart data={data}>
                    <Line type="monotone" dataKey="demand" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>

            <h3> Feature Importances </h3>
            <Box pb={4}> 
            <ResponsiveContainer width='100%' height={300}>
              
                <BarChart data={featureData} margin={{
      top: 0,
      right: 0,
      left: 0,
      bottom: 100
    }}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                        {featureData.map((entry, index) => (
                            <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                  </BarChart>

            </ResponsiveContainer>
            </Box>
        </div>
    );
};

export default ForecastCharts;
