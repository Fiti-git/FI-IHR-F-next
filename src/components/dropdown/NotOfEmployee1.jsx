"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function NotOfEmployee1() {
  const [getJobTypes, setJobTypes] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // We are reusing the 'NoOfEmployee' store state to hold 'Job Type' data
  // to avoid breaking the global store structure.
  const setNoOfEmployeeState = listingStore((state) => state.setNoOfEmployee);
  const getNoOfEmployeeState = listingStore((state) => state.getNoOfEmployee);

  const jobTypeHandler = (data) => {
    if (!getJobTypes.includes(data)) {
      return setJobTypes([...getJobTypes, data]);
    }
    const deleted = getJobTypes.filter((item) => item !== data);
    setJobTypes(deleted);
  };

  const jobTypeSubmitHandler = () => {
    setNoOfEmployeeState([]);
    getJobTypes.forEach((item) => {
      setNoOfEmployeeState(item);
    });
  };

  useEffect(() => {
    setJobTypes(getNoOfEmployeeState);
  }, [getNoOfEmployeeState]);

  // Fetch Job Types from API
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/profile/job-providers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);

        // Extract unique job types
        const uniqueTypes = [...new Set(
          data
            .map(item => item.job_type)
            .filter(type => type) // remove null
        )];
        
        setAvailableJobTypes(uniqueTypes.sort());
      } catch (err) {
        console.error("Failed to load job types", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTypes();
  }, []);

  const formatName = (str) => {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <div className="widget-wrapper pb25 mb0">
        <div className="checkbox-style1">
          {loading && <p className="text-muted small">Loading types...</p>}
          
          {!loading && availableJobTypes.length === 0 && (
             <p className="text-muted small">No job types found</p>
          )}

          {availableJobTypes.map((item, i) => (
            <label key={i} className="custom_checkbox">
              {formatName(item)}
              <input
                type="checkbox"
                onChange={() => jobTypeHandler(item)}
                checked={getJobTypes.includes(item)}
              />
              <span className="checkmark" />
            </label>
          ))}
        </div>
      </div>
      <button
        onClick={jobTypeSubmitHandler}
        className="done-btn ud-btn btn-thm dropdown-toggle"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button>
    </>
  );
}