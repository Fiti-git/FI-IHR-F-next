"use client";

import { useState, useEffect } from "react";
import { shopProduct1 } from "@/data/product";
import ShopListCard1 from "../card/ShopListCard1";
import ShopListInfo1 from "../element/ShopListInfo1";
import ShopAreaSidebar1 from "../sidebar/ShopAreaSidebar1";
import Pagination1 from "./Pagination1";
import priceStore from "@/store/priceStore";
import listingStore from "@/store/listingStore";

export default function ShopArea1() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 rows x 3 columns

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getSearch = listingStore((state) => state.getSearch);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [getCategory, priceRange, getBestSeller, getSearch]);

  // Filter functions
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.category) : item;

  const salaryFilter = (item) =>
    priceRange.min <= item.price && priceRange.max >= item.price;

  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? item : item.sort === getBestSeller;

  const searchFilter = (item) =>
    getSearch !== ""
      ? item.title.toLowerCase().includes(getSearch.toLowerCase())
      : item;

  // Apply all filters
  const filteredProducts = shopProduct1
    .filter(categoryFilter)
    .filter(salaryFilter)
    .filter(sortByFilter)
    .filter(searchFilter);

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of products section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = paginatedProducts.map((item, i) => (
    <div key={i} className="col-sm-6 col-xl-4">
      <ShopListCard1 data={item} />
    </div>
  ));

  return (
    <>
      <section className="shop-checkout pt-0">
        <div className="container">
          <div className="row wow fadeInUp" data-wow-delay="300ms">
            <div className="col-lg-3">
              <ShopAreaSidebar1 />
            </div>
            <div className="col-lg-9">
              <ShopListInfo1 length={totalItems} />
              <div className="row">
                {content.length > 0 ? (
                  content
                ) : (
                  <div className="col-12">
                    <div className="text-center p-5">
                      <p>No products found matching your criteria.</p>
                    </div>
                  </div>
                )}
              </div>
              {filteredProducts.length > 0 && (
                <Pagination1
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  maxVisiblePages={5}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}