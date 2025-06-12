"use client";

import { useState, useEffect } from "react";

const PriceCalculator = () => {
  const [helpers, setHelpers] = useState(2);
  const [hours, setHours] = useState(4);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(helpers * hours * 50);
  }, [helpers, hours]);

  return (
    <div className="calculator">
      <h2>Price Calculator</h2>
      
      <div className="calculator-row">
        <label>Helpers</label>
        <div className="input-group">
          <button onClick={() => helpers > 1 && setHelpers(helpers - 1)}>-</button>
          <input 
            type="number" 
            value={helpers} 
            onChange={(e) => setHelpers(Math.max(1, parseInt(e.target.value) || 1))}
            min="1" 
          />
          <button onClick={() => setHelpers(helpers + 1)}>+</button>
        </div>
      </div>

      <div className="calculator-row">
        <label>Hours</label>
        <div className="input-group">
          <button onClick={() => hours > 1 && setHours(hours - 1)}>-</button>
          <input 
            type="number" 
            value={hours} 
            onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
            min="1" 
          />
          <button onClick={() => setHours(hours + 1)}>+</button>
        </div>
      </div>

      <div className="total">
        <span>{helpers} × {hours} × 50€</span>
        <span className="total-price">{total}€</span>
      </div>
    </div>
  );
};

export default PriceCalculator;