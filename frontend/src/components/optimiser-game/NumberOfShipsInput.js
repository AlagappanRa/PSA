import React, { useState } from 'react';

const NumberOfShipsInput = ({ onEnter }) => {
  const [numShips, setNumShips] = useState('');

  const handleChange = (e) => {
    setNumShips(e.target.value);
  };

  const handleSubmit = () => {
    if (numShips >= 5 && numShips <= 10) {
      onEnter(numShips);
    } else {
      alert('Please enter a number between 5 and 10.');
    }
  };

  return (
    <div>
      <label>
        Input the number of ships (5-10):
        <input type="number" value={numShips} onChange={handleChange} />
      </label>
      <button onClick={handleSubmit}>Enter</button>
    </div>
  );
};

export default NumberOfShipsInput;
