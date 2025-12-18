"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function CategoryOption1() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategory = listingStore((state) => state.getCategory);
  const setCategory = listingStore((state) => state.setCategory);

  // Fetch unique categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/project/projects/');
        const data = response.data;

        // Get unique categories and count them
        const categoryCounts = data.reduce((acc, project) => {
          const cat = project.category || "Uncategorized";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        const categoryList = Object.entries(categoryCounts).map(([title, total]) => ({
          title,
          total
        }));

        setCategories(categoryList);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const categoryHandler = (data) => {
    setCategory(data);
  };

  if (loading) return <p className="text-muted small">Loading categories...</p>;

  return (
    <>
      <div className="checkbox-style1 mb15">
        {categories.length === 0 ? (
           <p className="text-muted small">No categories found</p>
        ) : (
          categories.map((item, i) => (
            <label key={i} className="custom_checkbox">
              {item.title}
              <input
                type="checkbox"
                onChange={() => categoryHandler(item.title)}
                checked={getCategory.includes(item.title)}
              />
              <span className="checkmark" />
              <span className="right-tags">({item.total})</span>
            </label>
          ))
        )}
      </div>
    </>
  );
}