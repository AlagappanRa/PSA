import React, { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const OptimizeResources = () => {
  const [resources, setResources] = useState({/* initial state */});
  const [allocation, setAllocation] = useState(null);

  const optimizeResources = async () => {
    try {
      const response = await axios.post('http://localhost:5000/optimize', resources);
      setAllocation(response.data.optimized_allocation);
    } catch (error) {
      console.error('There was an error optimizing resources!', error);
    }
  };

  return (
    <div style={{marginBottom: '20px', display: "flex", alignItems:"center", justifyContent: "center"}}>
      {/* Add TextFields to input resources and profits */}
      <Button variant="contained" color="secondary" onClick={optimizeResources}>
        Optimize Resources
      </Button>
      {allocation && (
        <div>
          {/* Display optimized allocation */}
        </div>
      )}
    </div>
  );
};

export default OptimizeResources;
