"use client";
import Search1 from "../element/Search1";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function LocationOption1() {
  const [locations, setLocations] = useState([]);
  
  const getLocation = listingStore((state) => state.getLocation);
  const setLocation = listingStore((state) => state.setLocation);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/api/project/projects/');
        const data = response.data;
        
        // Count countries
        const locCounts = data.reduce((acc, project) => {
          // Use country_name from API
          const country = project.country_name || "Remote";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {});

        const locList = Object.entries(locCounts).map(([title, total]) => ({
          title,
          // Create slug for consistent filtering logic if needed (e.g. "united-states")
          value: title.toLowerCase().split(' ').join('-'),
          total
        }));

        setLocations(locList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  const locationHandler = (data) => {
    setLocation(data);
  };

  return (
    <>
      <div className="card-body card-body px-0 pt-0">
        <Search1 />
        <div className="checkbox-style1 mb15 mt-3">
          {locations.length === 0 ? <p className="text-muted small">No locations found</p> : null}

          {locations.map((item, i) => (
            <label key={i} className="custom_checkbox">
              {item.title}
              <input
                type="checkbox"
                checked={getLocation.includes(item.value)}
                onChange={() => locationHandler(item.value)}
              />
              <span className="checkmark" />
              <span className="right-tags">({item.total})</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}