import React, { useState } from 'react';

const NumberOfBerthsInput = ({ numShips, onEnter }) => {
  const [numBerths, setNumBerths] = useState('');

  const handleChange = (e) => {
    setNumBerths(e.target.value);
  };

  const handleSubmit = () => {
    if (numBerths >= 2 && numBerths <= numShips) {
      onEnter(numBerths);
    } else {
      alert(`Please enter a number between 2 and ${numShips}.`);
    }
  };

  return (
    <div>
      <label>
        Input the number of berths (2-{numShips}):
        <input type="number" value={numBerths} onChange={handleChange} />
      </label>
      <button onClick={handleSubmit}>Enter</button>
    </div>
  );
};

export default NumberOfBerthsInput;
