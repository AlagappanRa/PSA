import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#FFBB28'];

const ForecastCharts = ({ forecast }) => {
    const { future_demand, historical_demand, comparison, feature_importances } = forecast;

    const data = historical_demand.map((demand, index) => ({
        name: `Day ${index + 1}`,
        demand,
    }));

    data.push({ name: 'Future', demand: future_demand[0] });

    return (
        <div>
            <h3> Demand Forecast </h3>
            <LineChart width={500} height={300} data={data}>
                <Line type="monotone" dataKey="demand" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
            </LineChart>

            <h3> Feature Importances </h3>
            <BarChart width={500} height={300} data={feature_importances.map((val, index) => ({ name: `Feature ${index + 1}`, value: val }))}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                    {feature_importances.map((val, index) => (
                        <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                </Bar>
            </BarChart>

            <div style={{ marginTop: '20px' }}>
                <h3>Comparison</h3>
                <p>Increase in Demand: {comparison.increase_in_demand[0]}</p>
                <p>Percentage Increase: {comparison.percentage_increase[0]}%</p>
            </div>
        </div>
    );
};

export default ForecastCharts;
