import React from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';

const TrainModel = () => {
  const trainModel = async () => {
    try {
      const response = await axios.post('http://localhost:5000/train', {/* your training data */});
      console.log(response.data);
    } catch (error) {
      console.error('There was an error training the model!', error);
    }
  };

  return (
    <div style={{marginBottom: '20px', display: "flex", alignItems:"center", justifyContent: "center"}}>
    <Button variant="contained" color="primary" onClick={trainModel}>
      Train Model
    </Button>
    </div>
  );
};

export default TrainModel;
