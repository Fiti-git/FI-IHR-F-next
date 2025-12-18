"use client";
import priceStore from "@/store/priceStore";
import { useEffect, useState } from "react";
import Slider from "rc-slider";
import api from "@/lib/axios";

export default function PriceDropdown1() {
  const [maxPrice, setMaxPrice] = useState(1000); // Default fallback
  const [getPrice, setPrice] = useState({
    min: 0,
    max: 1000,
  });

  const priceRange = priceStore((state) => state.priceRange);
  const setPriceRange = priceStore((state) => state.priceRangeHandler);

  // Fetch max hourly rate from API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await api.get("/api/profile/freelancers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        // Find highest hourly rate
        const rates = data.map(item => parseFloat(item.hourly_rate)).filter(r => !isNaN(r));
        if (rates.length > 0) {
          const highest = Math.ceil(Math.max(...rates));
          // Add a buffer to the max range (e.g., if max is 80, set slider max to 100)
          const newMax = highest < 100 ? 100 : highest + 50;
          setMaxPrice(newMax);
          
          // Only update local state max if it hasn't been set by user
          if (getPrice.max === 100000 || getPrice.max === 1000) {
              setPrice(prev => ({ ...prev, max: newMax }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrices();
  }, []);

  const priceHandler = (data) => {
    setPrice({
      min: data[0],
      max: data[1],
    });
  };

  useEffect(() => {
    setPrice(priceRange);
  }, [priceRange]);

  return (
    <>
      <div className="widget-wrapper pb25 mb0 pr20">
        <div className="range-slider-style1">
          <div className="range-wrapper">
            <div className="price__range__box">
              <Slider
                className="horizontal-slider"
                value={[getPrice.min, getPrice.max]}
                min={0}
                range
                max={maxPrice}
                onChange={priceHandler}
              />
            </div>
            <div className="d-flex gap-1 align-items-center pt-4">
              <input
                type="number"
                className="amount w-100"
                placeholder="$0"
                min={0}
                value={getPrice.min}
                onChange={(e) =>
                  setPrice({
                    ...getPrice,
                    min: Number(e.target.value),
                  })
                }
              />
              <span className="fa-sharp fa-solid fa-minus mx-1 dark-color" />
              <input
                type="number"
                className="amount2 w-100"
                placeholder={`$${maxPrice}`}
                min={0}
                max={maxPrice}
                value={getPrice.max}
                onChange={(e) =>
                  setPrice({
                    ...getPrice,
                    max: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => setPriceRange(getPrice.min, getPrice.max)}
        className="done-btn ud-btn btn-thm drop_btn3"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button>
    </>
  );
}