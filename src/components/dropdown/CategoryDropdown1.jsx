"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function CategoryDropdown1() {
  const [getCategory, setCategory] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const setCategoryState = listingStore((state) => state.setCategory);
  const getCategoryState = listingStore((state) => state.getCategory);

  // Toggle selection
  const categoryHandler = (data) => {
    if (!getCategory.includes(data)) {
      return setCategory([...getCategory, data]);
    }
    const deleted = getCategory.filter((item) => item !== data);
    setCategory(deleted);
  };

  // Apply to global store
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

  // Fetch Specializations from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/profile/freelancers/");
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        // Extract unique specializations
        const uniqueSpecs = [...new Set(
          data
            .map(item => item.specialization)
            .filter(spec => spec) // remove null/undefined
        )];
        
        setAvailableCategories(uniqueSpecs.sort());
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Formatter for display (e.g. "web-dev" -> "Web Dev")
  const formatName = (str) => {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <div className="widget-wrapper pr20">
        <div className="checkbox-style1">
          {loading && <p className="text-muted text-sm">Loading categories...</p>}
          
          {!loading && availableCategories.length === 0 && (
            <p className="text-muted text-sm">No categories found</p>
          )}

          {!loading && availableCategories.map((cat, i) => (
            <label key={i} className="custom_checkbox">
              {formatName(cat)}
              <input
                type="checkbox"
                onChange={() => categoryHandler(cat)}
                checked={getCategory.includes(cat)}
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