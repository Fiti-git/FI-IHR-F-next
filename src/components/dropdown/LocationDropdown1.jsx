"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function LocationDropdown1() {
  const [getLocation, setLocation] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  
  const getOurLocation = listingStore((state) => state.getLocation);
  const setOurLocation = listingStore((state) => state.setLocation);

  const locationHandler = (data) => {
    const isExist = getLocation.includes(data);
    if (!isExist) {
      return setLocation((item) => [...item, data]);
    }
    const deleted = getLocation.filter((item) => item !== data);
    setLocation(deleted);
  };

  useEffect(() => {
    setLocation(getOurLocation);
  }, [getOurLocation]);

  // Fetch Locations (Cities)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get("/api/profile/freelancers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        // Get unique cities
        const uniqueCities = [...new Set(
          data.map(item => item.city).filter(Boolean)
        )];
        setAvailableLocations(uniqueCities.sort());
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  // Helper to create slug for store (london) vs display (London)
  const toSlug = (str) => str.toLowerCase().split(" ").join("-");
  const formatLoc = (str) => str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      <div className="widget-wrapper pr20">
        <div className="checkbox-style1">
          {availableLocations.length === 0 ? <p className="text-muted text-sm">No locations found</p> : null}

          {availableLocations.map((loc, i) => (
            <label key={i} className="custom_checkbox">
              {formatLoc(loc)}
              <input
                type="checkbox"
                checked={getLocation.includes(toSlug(loc))}
                onChange={() => locationHandler(toSlug(loc))}
              />
              <span className="checkmark" />
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          setOurLocation([]);
          getLocation.forEach((item) => {
            setOurLocation(item);
          });
        }}
        className="done-btn ud-btn btn-thm drop_btn4"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button>
    </>
  );
}