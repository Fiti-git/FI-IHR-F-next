"use client";
import listingStore from "@/store/listingStore";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function ProjectTypeOption1() {
  const [projectTypes, setProjectTypes] = useState([]);
  
  const getProjectType = listingStore((state) => state.getProjectType);
  const setProjectType = listingStore((state) => state.setProjectType);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await api.get('/api/project/projects/');
        const data = response.data;

        // Count project types
        const typeCounts = data.reduce((acc, project) => {
          // Normalize API response (fixed_price -> Fixed Price)
          const rawType = project.project_type || "fixed_price";
          const formattedType = rawType === 'hourly' ? 'Hourly' : 'Fixed Price';
          // We use the raw value for filtering logic usually, but here we group for display
          // Note: Ensure your filter logic in Listing8 matches the value stored here.
          // Storing Raw value for consistency with API
          
          acc[rawType] = (acc[rawType] || 0) + 1;
          return acc;
        }, {});

        const typeList = Object.entries(typeCounts).map(([value, total]) => ({
          title: value === 'hourly' ? 'Hourly Rate' : 'Fixed Price',
          value: value, 
          total
        }));

        setProjectTypes(typeList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTypes();
  }, []);

  const projectTypeHandler = (data) => {
    setProjectType(data);
  };

  return (
    <>
      {projectTypes.map((item, i) => (
        <div key={i} className="switch-style1">
          <div className="form-check form-switch mb20">
            <input
              className="form-check-input mt-0"
              type="checkbox"
              id={`switch_${i}`}
              // Check against the raw value
              checked={getProjectType.includes(item.value)}
              onChange={() => projectTypeHandler(item.value)}
            />
            <label
              className="form-check-label mt-0"
              htmlFor={`switch_${i}`}
            >
              {item.title}
            </label>
            <span className="right-tags">({item.total})</span>
          </div>
        </div>
      ))}
    </>
  );
}