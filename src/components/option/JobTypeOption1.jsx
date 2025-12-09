"use client";
import { jobType } from "@/data/listing";
import listingStore from "@/store/listingStore";

export default function JobTypeOption1({ availableJobTypes }) {
  const getJobType = listingStore((state) => state.getJobType);
  const setJobType = listingStore((state) => state.setJobType);

  // handler
  const jobTypeHandlere = (data) => {
    setJobType(data);
  };

  // Use availableJobTypes if provided, otherwise fall back to static data
  const jobTypesToShow = availableJobTypes && availableJobTypes.length > 0 
    ? availableJobTypes 
    : jobType;

  return (
    <>
      <div className="widget-wrapper pr20">
        {jobTypesToShow.map((item,i) => (
          <div key={ i } className="switch-style1">
            <div className="form-check form-switch mb20">
              <input
                className="form-check-input"
                type="checkbox"
                id={`flexSwitchCheckDefault5${item.id}`}
                checked={getJobType.includes(item.title)}
                onChange={() => jobTypeHandlere(item.title)}
              />
              <label
                className="form-check-label"
                htmlFor={`flexSwitchCheckDefault5${item.id}`}
              >
                {item.title}
              </label>
              <span className="right-tags">({item.total})</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
