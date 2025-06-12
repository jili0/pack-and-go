"use client";

import { useState, useEffect } from "react";

const PriceCalculator = () => {
  const [helpersCount, setHelpersCount] = useState(2);
  const [hours, setHours] = useState(4);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Calculate total price
    setTotalPrice(helpersCount * hours * 50);
  }, [helpersCount, hours, 50]);

  return (
    <div>
      <h2>Moving Price Calculator</h2>

      <div>
        <div>
          <label>Number of Helpers</label>
          <div>
            <button
              type="button"
              onClick={() =>
                helpersCount > 1 && setHelpersCount(helpersCount - 1)
              }
              aria-label="Decrease helpers count"
            >
              -
            </button>
            <input
              type="number"
              value={helpersCount}
              onChange={(e) =>
                setHelpersCount(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
              max="10"
              aria-label="Number of helpers"
            />
            <button
              type="button"
              onClick={() => setHelpersCount(helpersCount + 1)}
              aria-label="Increase helpers count"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label>Estimated Hours</label>
          <div>
            <button
              type="button"
              onClick={() => hours > 1 && setHours(hours - 1)}
              aria-label="Decrease hours"
            >
              -
            </button>
            <input
              type="number"
              value={hours}
              onChange={(e) =>
                setHours(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
              max="24"
              aria-label="Estimated hours"
            />
            <button
              type="button"
              onClick={() => setHours(hours + 1)}
              aria-label="Increase hours"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div>
        <div>
          <p>
            {helpersCount} helpers × {hours} hours × 50€ per helper
          </p>
        </div>
        <div>
          <span>Total Price:</span>
          <span>{totalPrice}€</span>
        </div>
      </div>

      <p>
        The final price may vary based on the actual time needed for the move.
      </p>
    </div>
  );
};

export default PriceCalculator;
