"use client";
import priceStore from "@/store/priceStore";
import { useEffect, useState } from "react";
import Slider from "rc-slider";
import api from '@/lib/axios';
import 'rc-slider/assets/index.css'; 

export default function BudgetOption2() {
  const [maxPrice, setMaxPrice] = useState(10000); // Default fallback
  
  const priceRange = priceStore((state) => state.priceRange);
  const setPriceRange = priceStore((state) => state.priceRangeHandler);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await api.get('/api/project/projects/');
        const data = response.data;
        
        // Find max budget
        const budgets = data.map(p => parseFloat(p.budget)).filter(b => !isNaN(b));
        if (budgets.length > 0) {
          const max = Math.ceil(Math.max(...budgets));
          // Add buffer
          setMaxPrice(max + 100);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBudgets();
  }, []);

  const handleSliderChange = (value) => {
    setPriceRange(value[0], value[1]);
  };

  return (
    <>
      <div className="range-slider-style2">
        <div className="range-wrapper">
          <Slider
            range
            min={0}
            max={maxPrice}
            value={[priceRange.min, priceRange.max > maxPrice ? maxPrice : priceRange.max]}
            onChange={handleSliderChange}
            trackStyle={[{ backgroundColor: "#5BBB7B" }]}
            handleStyle={[
              { borderColor: "#5BBB7B", backgroundColor: "#fff" },
              { borderColor: "#5BBB7B", backgroundColor: "#fff" }
            ]}
            railStyle={{ backgroundColor: "#E9ECEF" }}
          />
          <div className="d-flex align-items-center justify-content-center pt-3">
            <span id="slider-range-value1">${priceRange.min}</span>
            <i className="fa-sharp fa-solid fa-minus mx-2 dark-color icon" />
            <span id="slider-range-value2">${priceRange.max > maxPrice ? maxPrice : priceRange.max}</span>
          </div>
        </div>
      </div>
    </>
  );
}