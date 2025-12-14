"use client";
import { useEffect, useState } from "react";
import EmployeeCard1 from "../card/EmployeeCard1";
import ListingOption5 from "../element/ListingOption5";
import Pagination1 from "./Pagination1";
import ListingSidebarModal4 from "../modal/ListingSidebarModal4";
import listingStore from "@/store/listingStore";
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

export default function Listing11({ searchFilters }) {
  const [jobProviders, setJobProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Get filter states from the store
  const getCategory = listingStore((state) => state.getCategory);
  const getNoOfEmployee = listingStore((state) => state.getNoOfEmployee);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters, getCategory, getNoOfEmployee, getBestSeller]);

  // Fetch all job provider profiles
  useEffect(() => {
    const fetchJobProviders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/profile/job-providers/");
        setJobProviders(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching job providers:", err);
        if (err.response?.status === 404) {
          setJobProviders([]);
          setError("No job provider profiles found");
        } else {
          setError(err.response?.data?.message || err.message);
          setJobProviders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobProviders();
  }, []);

  // --- Helpers ---

  // Capitalize words for display
  const formatText = (text) => {
    if (!text) return "";
    return text
      .split(/[-_ ]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Normalize strings for comparison (removes case, spaces, and dashes)
  // Example: "Full-Time" becomes "fulltime", "part time" becomes "parttime"
  const normalize = (text) => {
    if (!text) return "";
    return text.toLowerCase().replace(/[-_ ]/g, "");
  };

  // --- Transformation ---

  const transformJobProvider = (provider) => {
    // 1. Handle Image
    let imageUrl = "/images/team/client-1.png";
    if (provider.profile_image_url) {
      imageUrl = provider.profile_image_url;
    } else if (provider.profile_image) {
      imageUrl = provider.profile_image.startsWith('http') 
        ? provider.profile_image 
        : `${API_BASE_URL}${provider.profile_image}`;
    }

    // 2. Data Preparation
    const displayName = provider.company_name || "Confidential Company";
    const industryRaw = provider.industry || "";
    const jobTypeRaw = provider.job_type || "";
    const countryRaw = provider.country || "";

    // 3. Formatted Displays
    const countryMap = {
      'usa': 'United States',
      'uk': 'United Kingdom',
      'uae': 'United Arab Emirates'
    };
    const locationDisplay = countryMap[countryRaw.toLowerCase()] || formatText(countryRaw) || "Location N/A";
    const industryDisplay = formatText(industryRaw) || "General";

    const userId = provider.user?.id || provider.id;

    return {
      // Data for Card Component
      id: userId,
      img: imageUrl,
      server: displayName,      
      jobs: industryDisplay,    
      location: locationDisplay,
      
      // Data for Filtering
      providerId: provider.id,
      categoryRaw: industryRaw,     // e.g. "technology"
      jobTypeRaw: jobTypeRaw,       // e.g. "full-time" or "part-time"
      
      // Sort key (Default to ID descending if no specific sort field exists)
      sort: "best-seller", // Placeholder to allow default sort to pass
      
      // Search Data
      searchableText: `
        ${displayName} 
        ${industryDisplay} 
        ${locationDisplay} 
        ${provider.company_overview || ""}
      `.toLowerCase()
    };
  };

  // --- Filter Logic ---

  // 1. Search Bar Filter
  const searchFilter = (item) => {
    if (!searchFilters || !searchFilters.keyword || searchFilters.keyword.trim() === '') {
      return true;
    }
    const keyword = searchFilters.keyword.toLowerCase().trim();
    return item.searchableText.includes(keyword);
  };

  // 2. Location Search Filter
  const locationFilter = (item) => {
    if (!searchFilters || !searchFilters.location) {
      return true;
    }
    const searchLocation = searchFilters.location.toLowerCase();
    return item.location.toLowerCase().includes(searchLocation);
  };

  // 3. Category Filter (Industry)
  const categoryFilter = (item) => {
    // If no category selected, show all
    if (!getCategory || getCategory.length === 0) return true;
    
    // Check if item category matches ANY of the selected categories
    // Uses normalize to match "Technology" (sidebar) with "technology" (api)
    return getCategory.some(selectedCat => 
      normalize(selectedCat) === normalize(item.categoryRaw)
    );
  };

  // 4. Job Type / No of Employee Filter
  // Note: Mapping "No of Employee" variable to "Job Type" data as requested
  const jobTypeFilter = (item) => {
    if (!getNoOfEmployee || getNoOfEmployee.length === 0) return true;

    // Check if item job type matches ANY selected filter
    return getNoOfEmployee.some(selectedType => 
      normalize(selectedType) === normalize(item.jobTypeRaw)
    );
  };

  // 5. Sort Filter
  const sortByFilter = (item) => {
    if (!getBestSeller || getBestSeller === "best-seller") return true;
    // If you have specific sort logic (like 'newest'), add it here. 
    // Currently defaulting to true to prevent empty results on sort change.
    return true; 
  };

  // --- Apply Filters ---
  const filteredProviders = jobProviders
    .map(transformJobProvider)
    .filter(searchFilter)
    .filter(locationFilter)
    .filter(categoryFilter)
    .filter(jobTypeFilter)
    .filter(sortByFilter);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProviders.slice(indexOfFirstItem, indexOfLastItem);

  const content = currentItems.map((item) => (
    <div key={`job-provider-${item.providerId}`} className="col-sm-6 col-lg-4 col-xl-3">
      <EmployeeCard1 data={item} />
    </div>
  ));

  if (loading) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption5 />

          {/* Results Count */}
          <div className="row mb-3">
            <div className="col-12">
               <p className="text-muted">
                 Showing {filteredProviders.length} result{filteredProviders.length !== 1 ? 's' : ''}
               </p>
            </div>
          </div>

          <div className="row">
            {content.length > 0 ? (
              content
            ) : (
              <div className="col-12 text-center py-5">
                <div className="alert alert-light">
                  <h5>No Results Found</h5>
                  <p>Try adjusting your filters to find what you are looking for.</p>
                  {(getCategory?.length > 0 || getNoOfEmployee?.length > 0) && (
                     <small className="text-muted">
                       Current Filters: 
                       {getCategory?.length > 0 && ` Category (${getCategory.join(', ')})`}
                       {getNoOfEmployee?.length > 0 && ` Job Type (${getNoOfEmployee.join(', ')})`}
                     </small>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {filteredProviders.length > itemsPerPage && (
            <div className="row">
              <div className="mt30">
                <Pagination1
                  totalItems={filteredProviders.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </div>
      </section>
      <ListingSidebarModal4 />
    </>
  );
}