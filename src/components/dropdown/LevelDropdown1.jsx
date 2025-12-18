"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function LevelDropdown1() {
  const [getLevel, setLevel] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);

  const setOurLevel = listingStore((state) => state.setLevel);
  const getOurLevel = listingStore((state) => state.getLevel);

  const levelHandler = (data) => {
    const isExist = getLevel.includes(data);
    if (!isExist) {
      return setLevel((item) => [...item, data]);
    }
    const deleted = getLevel.filter((item) => item !== data);
    setLevel(deleted);
  };

  useEffect(() => {
    setLevel(getOurLevel);
  }, [getOurLevel]);

  // Fetch Levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get("/api/profile/freelancers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        const uniqueLevels = [...new Set(
          data.map(item => item.experience_level).filter(Boolean)
        )];
        setAvailableLevels(uniqueLevels.sort());
      } catch (err) {
        console.error(err);
      }
    };
    fetchLevels();
  }, []);

  const formatLevel = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <>
      <div className="widget-wrapper pb25 mb0">
        <div className="checkbox-style1">
          {availableLevels.length === 0 ? <p className="text-muted text-sm">No levels found</p> : null}
          
          {availableLevels.map((lvl, i) => (
            <label key={i} className="custom_checkbox">
              {formatLevel(lvl)}
              <input
                type="checkbox"
                onChange={() => levelHandler(lvl)}
                checked={getLevel.includes(lvl)}
              />
              <span className="checkmark" />
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          setOurLevel([]);
          getLevel.forEach((item) => {
            setOurLevel(item);
          });
        }}
        className="done-btn ud-btn btn-thm dropdown-toggle"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button>
    </>
  );
}