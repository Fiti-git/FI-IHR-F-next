"use client";

import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";

// Fetch unique job_category values from API and present them as category filter options
const BASE_API_URL = "http://206.189.134.117:8000";

export default function CategoryDropdown1() {
  const [getCategory, setCategory] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const setCategoryState = listingStore((state) => state.setCategory);
  const getCategoryState = listingStore((state) => state.getCategory);

  // handler
  const categoryHandler = (data) => {
    if (!getCategory.includes(data)) {
      return setCategory([...getCategory, data]);
    }
    const deleted = getCategory.filter((item) => item !== data);
    setCategory(deleted);
  };

  const categorySumitHandler = () => {
    setCategoryState([]);
    getCategory.forEach((item) => {
      setCategoryState(item);
    });
  };

  useEffect(() => {
    setCategory(getCategoryState);
  }, [getCategoryState]);

  // load categories from API on mount
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/job-posting/`);
        if (!res.ok) return;
        const data = await res.json();
        const jobsArray = Array.isArray(data) ? data : data.results || data.jobs || data.data || [];
        const cats = new Set();
        jobsArray.forEach((j) => {
          const c = j.job_category || j.category || null;
          if (typeof c === 'string' && c.trim().length > 0) {
            cats.add(c.trim());
          }
        });
        if (mounted) setAvailableCategories(Array.from(cats));
      } catch (e) {
        console.error('Failed to load job categories', e);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <div className="widget-wrapper pr20">
        <div className="checkbox-style1">
          {availableCategories.length === 0 ? (
            <div className="p-2">No categories available</div>
          ) : (
            availableCategories.map((cat, i) => (
              <label key={cat + i} className="custom_checkbox">
                {cat[0]?.toUpperCase() + cat.slice(1)}
                <input
                  type="checkbox"
                  onChange={() => categoryHandler(cat)}
                  checked={getCategory.includes(cat)}
                />
                <span className="checkmark" />
              </label>
            ))
          )}
        </div>
      </div>
      <button
        onClick={categorySumitHandler}
        className="done-btn ud-btn btn-thm drop_btn4"
      >
        Apply
        <i className="fal fa-arrow-right-long" />
      </button>
    </>
  );
}
