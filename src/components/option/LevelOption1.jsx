"use client";
import { level } from "@/data/listing";
import listingStore from "@/store/listingStore";

export default function LevelOption1({ availableLocations }) {
  const getLocation = listingStore((state) => state.getLocation);
  const setLocation = listingStore((state) => state.setLocation);

  // handler
  const locationHandler = (data) => {
    setLocation(data);
  };

  // Use availableLocations if provided, otherwise fall back to static data
  const locationsToShow = availableLocations && availableLocations.length > 0 
    ? availableLocations 
    : level;

  return (
    <>
      <div className="card-body card-body px-0 pt-0">
        <div className="checkbox-style1">
          {locationsToShow.map((item,i) => (
            <label key={ i } className="custom_checkbox">
              {item.title}
              <input
                type="checkbox"
                onChange={() => locationHandler(item.title)}
                checked={getLocation.includes(item.title)}
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
