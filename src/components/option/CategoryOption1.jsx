"use client";
import { category } from "@/data/listing";
import listingStore from "@/store/listingStore";

export default function CategoryOption1({ availableCategories }) {
  const getCategory = listingStore((state) => state.getCategory);
  const setCategory = listingStore((state) => state.setCategory);

  // handler
  const categoryHandler = (data) => {
    setCategory(data);
  };

  // Capitalize first letter of category
  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Use availableCategories if provided, otherwise fall back to static data
  const categoriesToShow = availableCategories && availableCategories.length > 0 
    ? availableCategories 
    : category;

  return (
    <>
      <div className="checkbox-style1 mb15">
        {categoriesToShow.map((item,i) => (
          <label key={ i } className="custom_checkbox">
            {capitalizeFirstLetter(item.title)}
            <input
              type="checkbox"
              onChange={() => categoryHandler(item.title)}
              checked={getCategory.includes(item.title)}
            />
            <span className="checkmark" />
            <span className="right-tags">({item.total})</span>
          </label>
        ))}
      </div>
    </>
  );
}
