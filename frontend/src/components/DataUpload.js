import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { amber, indigo } from '@mui/material/colors';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Papa from 'papaparse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const sampleCSV = `
berth_capacity,ship_size,cargo_volume,equipment_availability,worker_availability,operational_costs,tide_levels,ship_arrival_delays,demand
100.0,47.5281046698,1043.8817099246,8.0312804484,23,992.686801195,0.0,10,129.3959478218
150.0,59.4406050682,1136.2600349405,11.7294645301,17,1118.028438936,1.0,14,126.5372475394
200.0,56.0874881831,2072.3750094038,17.3991558443,20,2063.687019589,1.7320508076,43,133.6760209771
250.0,71.3089609182,2905.9045802751,27.5758697667,5,3049.770236191,2.0,46,182.8614360494
300.0,65.0478491094,3121.7311842363,29.7672733876,17,3155.783132249,1.7320508076,19,150.9501443663
350.0,81.8424339323,3810.8071061491,35.7445641912,11,3658.395653717,1.0,16,148.4297684313
400.0,80.1999687571,4463.0876908475,39.3891639828,8,4349.281224119,0.0,50,170.3800664689
450.0,89.3258188191,5158.3625840997,43.2513959987,22,5232.810341788,-1.0,43,226.0009174019
500.0,89.7612625217,5848.9461607378,54.063894587,7,5628.574222159,-1.7320508076,10,227.1352769632
550.0,102.0793651049,6038.2966430255,58.4503484128,21,6111.808898693,-2.0,29,203.6742348994
`;

const sampleCSV2 = `
ships,berth_capacity,berth_availability
10000,5000,1
15000,6000,1
20000,7000,1
25000,8000,1
12000,5500,0
13000,6500,1
18000,7500,1
19000,8500,0
11000,5200,1
16000,7200,1
27000,9000,1
14000,5600,0
22000,7600,1
24000,7800,1
17000,7100,0
28000,9100,1
26000,8900,1
21000,7400,0
23000,7700,1
29000,9200,1
`;


const theme = createTheme({
  palette: {
    primary: amber,
    secondary: indigo,
  },
});

const DataUpload = ({ onUpload, sampleData }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [csvData, setCsvData] = useState('');

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
    if (event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (result) => {
          console.log('Parsed Result', result);
          setData(result.data);
        },
        header: true,
      });
    }
  };

  const upload = async () => {
    const formData = new FormData();

    if (csvData) {
      console.log(csvData)
      const blob = new Blob([csvData], { type: 'text/csv' });
      if (onUpload) {
        onUpload(blob)
      }
      formData.append('file', blob, 'data.csv');
      console.log("Form data is : " + formData)
    } else if (file) {
      if (onUpload) {
        onUpload(file)
      }
      console.log("File is : " + file)
      formData.append('file', file);
    }

    console.log("Total print: " + formData)

    if (!onUpload) {
    try {
      console.log(formData.forEach(x => console.log(x)));
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/upload`,
        formData
      );
      setError('');

    } catch (error) {
      console.error('There was an error uploading the file!', error);
      setError('There was an error uploading the file!');
    }
    } 
};

const useSampleData = () => {
    let csv;
    if (sampleData === "demand_forecast") {
      csv = sampleCSV;
    } else if (sampleData === "optimise") {
      csv = sampleCSV2;
    }

    if (csv) {
        Papa.parse(csv, {
            header: true,
            skipEmptyLines: true, // This will skip empty lines in the CSV
            complete: (result) => {
                // We filter the data to remove any unwanted properties like __parsed_extra
                const cleanedData = result.data.map(item => {
                    const {__parsed_extra, ...cleanedItem} = item; // Removing __parsed_extra property
                    return cleanedItem;
                });

                setData(cleanedData);
                setCsvData(csv.trim());
            },
        });
    } else {
        console.error("Sample data type not recognized!");
    }
};
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <ThemeProvider theme={theme}>
              <Typography variant="h6" gutterBottom>
                Step 1: Choose Your Data
              </Typography>
              <Grid container spacing={2} direction="column" alignItems="center">
                <Grid item xs={12}>
                  <input
                    accept="*/*"
                    id="contained-button-file"
                    type="file"
                    hidden
                    onChange={onFileChange}
                  />
                  <label htmlFor="contained-button-file">
                    <Button variant="contained" color="primary" component="span">
                      Upload Your File
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" align="center">
                    OR
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="secondary" onClick={useSampleData}>
                    Use Sample Data
                  </Button>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom style={{marginTop: '20px'}}>
                Step 2: Review and Confirm
              </Typography>
              {data.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={upload}
                  >
                    Upload Data
                  </Button>
                </div>
              )}
              {error && (
                <Alert severity="error" style={{ marginTop: '10px' }}>
                  {error}
                </Alert>
              )}
            </ThemeProvider>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        {data.length > 0 && (
          <Card>
            <CardContent title="Preview Your Data">
              <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
                <TableContainer>
                  <Table stickyHeader aria-label="data table">
                    <TableHead>
                      <TableRow>
                        {Object.keys(data[0]).map((key, index) => (
                          <TableCell key={index}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
};

export default DataUpload;
