"use client";
import { useEffect, useState } from "react";
import EmployeeCard1 from "../card/EmployeeCard1";
import ListingOption5 from "../element/ListingOption5";
import Pagination1 from "./Pagination1";
import ListingSidebarModal4 from "../modal/ListingSidebarModal4";
import listingStore from "@/store/listingStore";

export default function Listing11({ searchFilters }) {
  const [jobProviders, setJobProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const getCategory = listingStore((state) => state.getCategory);
  const getNoOfEmployee = listingStore((state) => state.getNoOfEmployee);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  // Reset to page 1 when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters]);

  // Fetch all job provider profiles from public API
  useEffect(() => {
    const fetchJobProviders = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/api/profile/job-providers/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched job providers:", data);
          setJobProviders(data);
          setError(null);
        } else if (response.status === 404) {
          setJobProviders([]);
          setError("No job provider profiles found");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching job providers:", err);
        setError(err.message);
        setJobProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobProviders();
  }, []);

  // Transform API data to match the format expected by EmployeeCard1
  const transformJobProvider = (provider) => {
    // Handle profile_image_url first (from serializer), fallback to profile_image, then default
    const imageUrl = provider.profile_image_url 
      || (provider.profile_image 
          ? (provider.profile_image.startsWith('http') 
              ? provider.profile_image 
              : `http://127.0.0.1:8000${provider.profile_image}`)
          : "/images/team/client-1.png");

    // Extract user data from nested user object
    const user = provider.user || {};
    const userId = user.id;
    
    // Create display name from available user data
    const displayName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`.trim()
      : user.first_name || user.last_name || user.username || provider.company_name || "User";

    // Format country name for display
    const countryDisplay = {
      'usa': 'United States',
      'canada': 'Canada',
      'uk': 'United Kingdom'
    }[provider.country] || provider.country || "Location";

    // Format industry for display
    const industryDisplay = {
      'technology': 'Technology',
      'healthcare': 'Healthcare',
      'finance': 'Finance',
      'education': 'Education'
    }[provider.industry] || provider.industry || "Industry";

    // Format job type for display
    const jobTypeDisplay = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'remote': 'Remote'
    }[provider.job_type] || provider.job_type || "Full-time";

    return {
      // Fields that EmployeeCard1 expects
      id: userId,
      img: imageUrl,
      server: displayName,
      rating: "5.0",
      review: "0",
      location: countryDisplay,
      
      // Additional fields for reference and search
      providerId: provider.id,
      userId: userId,
      username: user.username || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      companyName: provider.company_name || "Company",
      category: provider.industry || "technology",
      categoryDisplay: industryDisplay,
      jobs: provider.job_type || "full-time",
      jobsDisplay: jobTypeDisplay,
      email: provider.email_address || user.email || "",
      phone: provider.phone_number || "",
      description: provider.company_overview || "",
      country: provider.country || "usa",
      countryRaw: provider.country || "usa",
    };
  };

  // Search filter - searches across multiple fields
  const searchFilter = (item) => {
    if (!searchFilters || !searchFilters.keyword || searchFilters.keyword.trim() === '') {
      return true;
    }

    const keyword = searchFilters.keyword.toLowerCase().trim();
    
    // Search in these fields
    const searchableFields = [
      item.companyName,
      item.server,
      item.categoryDisplay,
      item.jobsDisplay,
      item.description,
      item.location,
      item.username,
      item.firstName,
      item.lastName,
      item.email
    ];

    return searchableFields.some(field => 
      field && field.toLowerCase().includes(keyword)
    );
  };

  // Location filter
  const locationFilter = (item) => {
    if (!searchFilters || !searchFilters.location) {
      return true;
    }

    const searchLocation = searchFilters.location.toLowerCase();
    const itemCountry = (item.countryRaw || '').toLowerCase();
    const itemLocation = (item.location || '').toLowerCase();
    
    // Match against country code or display name
    return itemCountry.includes(searchLocation) || itemLocation.includes(searchLocation);
  };

  // Category filter (based on industry)
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.category) : true;

  // Job type filter
  const jobTypeFilter = (item) =>
    getNoOfEmployee?.length !== 0 ? getNoOfEmployee.includes(item.jobs) : true;

  // Sort by filter
  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? true : item.sort === getBestSeller;

  // Apply all filters
  const filteredProviders = jobProviders
    .map(transformJobProvider)
    .filter(searchFilter)        // NEW: Search keyword filter
    .filter(locationFilter)      // NEW: Location filter
    .filter(categoryFilter)
    .filter(jobTypeFilter)
    .filter(sortByFilter);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProviders.slice(indexOfFirstItem, indexOfLastItem);

  // Content rendering with unique keys
  const content = currentItems.map((item) => (
    <div key={`job-provider-${item.providerId}`} className="col-sm-6 col-lg-4 col-xl-3">
      <EmployeeCard1 data={item} />
    </div>
  ));

  // Loading state
  if (loading) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading job providers...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && jobProviders.length === 0) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption5 />
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="alert alert-warning" role="alert">
                <h4>No Job Providers Found</h4>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
        <ListingSidebarModal4 />
      </section>
    );
  }

  // Empty state
  if (jobProviders.length === 0) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption5 />
          <div className="row">
            <div className="col-12 text-center py-5">
              <p>No job providers available at the moment.</p>
            </div>
          </div>
        </div>
        <ListingSidebarModal4 />
      </section>
    );
  }

  // Check if search is active
  const isSearchActive = searchFilters && (searchFilters.keyword || searchFilters.location);

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption5 />
          
          {/* Search Results Info */}
          {isSearchActive && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                  <span>
                    Found <strong>{filteredProviders.length}</strong> result{filteredProviders.length !== 1 ? 's' : ''}
                    {searchFilters.keyword && ` for "${searchFilters.keyword}"`}
                    {searchFilters.location && ` in ${searchFilters.location}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="row">
            {content.length > 0 ? (
              content
            ) : (
              <div className="col-12 text-center py-5">
                <div className="alert alert-warning">
                  <h5>No Results Found</h5>
                  <p>
                    {isSearchActive 
                      ? "Try adjusting your search criteria or clearing filters." 
                      : "No job providers match your current filters."}
                  </p>
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