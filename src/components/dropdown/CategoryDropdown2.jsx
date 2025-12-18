"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function CategoryDropdown2() {
  const [getCategory, setCategory] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const setCategoryState = listingStore((state) => state.setCategory);
  const getCategoryState = listingStore((state) => state.getCategory);

  // Handler for checkbox toggle
  const categoryHandler = (data) => {
    if (!getCategory.includes(data)) {
      return setCategory([...getCategory, data]);
    }
    const deleted = getCategory.filter((item) => item !== data);
    setCategory(deleted);
  };

  // Apply button handler
  const categorySumitHandler = () => {
    setCategoryState([]);
    getCategory.forEach((item) => {
      setCategoryState(item);
    });
  };

  // Sync local state with global store
  useEffect(() => {
    setCategory(getCategoryState);
  }, [getCategoryState]);

  // Fetch Industries from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/profile/job-providers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);

        // Extract unique industries
        const uniqueIndustries = [...new Set(
          data
            .map(item => item.industry)
            .filter(ind => ind) // remove null/undefined
        )];
        
        setAvailableCategories(uniqueIndustries.sort());
      } catch (err) {
        console.error("Failed to load industries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Format text (e.g. "technology" -> "Technology")
  const formatName = (str) => {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <div className="widget-wrapper pr20">
        <div className="checkbox-style1">
          {loading && <p className="text-muted small p-2">Loading industries...</p>}
          
          {!loading && availableCategories.length === 0 && (
             <p className="text-muted small p-2">No categories found</p>
          )}

          {availableCategories.map((item, i) => (
            <label key={i} className="custom_checkbox">
              {formatName(item)}
              <input
                type="checkbox"
                onChange={() => categoryHandler(item)}
                checked={getCategory.includes(item)}
              />
              <span className="checkmark" />
            </label>
          ))}
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