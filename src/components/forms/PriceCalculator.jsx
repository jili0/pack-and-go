"use client";

import { useState, useEffect } from 'react';
import styles from '@/app/styles/PriceCalculator.module.css';

const PriceCalculator = () => {
  const [helpersCount, setHelpersCount] = useState(2);
  const [hours, setHours] = useState(4);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Calculate total price
    setTotalPrice(helpersCount * hours * 50);
  }, [helpersCount, hours, 50]);

  return (
    <div className={styles.calculator}>
      <h2 className={styles.calculatorTitle}>Moving Price Calculator</h2>
      
      <div className={styles.calculatorForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Number of Helpers</label>
          <div className={styles.inputGroup}>
            <button 
              type="button" 
              className={styles.decrementBtn}
              onClick={() => helpersCount > 1 && setHelpersCount(helpersCount - 1)}
              aria-label="Decrease helpers count"
            >
              -
            </button>
            <input
              type="number"
              value={helpersCount}
              onChange={(e) => setHelpersCount(Math.max(1, parseInt(e.target.value) || 1))}
              className={styles.numberInput}
              min="1"
              max="10"
              aria-label="Number of helpers"
            />
            <button 
              type="button" 
              className={styles.incrementBtn}
              onClick={() => setHelpersCount(helpersCount + 1)}
              aria-label="Increase helpers count"
            >
              +
            </button>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Estimated Hours</label>
          <div className={styles.inputGroup}>
            <button 
              type="button" 
              className={styles.decrementBtn}
              onClick={() => hours > 1 && setHours(hours - 1)}
              aria-label="Decrease hours"
            >
              -
            </button>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
              className={styles.numberInput}
              min="1"
              max="24"
              aria-label="Estimated hours"
            />
            <button 
              type="button" 
              className={styles.incrementBtn}
              onClick={() => setHours(hours + 1)}
              aria-label="Increase hours"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.result}>
        <div className={styles.calculation}>
          <p>{helpersCount} helpers × {hours} hours × 50€ per helper</p>
        </div>
        <div className={styles.totalPrice}>
          <span className={styles.priceLabel}>Total Price:</span>
          <span className={styles.price}>{totalPrice}€</span>
        </div>
      </div>
      
      <p className={styles.disclaimer}>
        The final price may vary based on the actual time needed for the move.
      </p>
    </div>
  );
};

export default PriceCalculator;