"use client";
import { useEffect, useState } from "react";
import EmployeeCard1 from "../card/EmployeeCard1";
import ListingOption5 from "../element/ListingOption5";
import Pagination1 from "./Pagination1";
import ListingSidebarModal4 from "../modal/ListingSidebarModal4";
import listingStore from "@/store/listingStore";

export default function Listing11() {
  const [jobProviders, setJobProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const getCategory = listingStore((state) => state.getCategory);
  const getNoOfEmployee = listingStore((state) => state.getNoOfEmployee);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  // Fetch all job provider profiles from public API
  useEffect(() => {
    const fetchJobProviders = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://206.189.134.117:8000/api/profile/job-providers/", {
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
    // Handle profile_image - if null, use default
    const imageUrl = provider.profile_image 
      ? (provider.profile_image.startsWith('http') 
          ? provider.profile_image 
          : `http://206.189.134.117:8000/${provider.profile_image}`)
      : "/images/team/default-company.png";

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

    return {
      // Fields that EmployeeCard1 expects
      id: userId,  // User ID for the link
      img: imageUrl,  // EmployeeCard1 uses 'img' not 'image'
      server: displayName,  // EmployeeCard1 uses 'server' for the name display
      rating: "0.0",  // You can add rating to your model later
      review: "0",  // You can add reviews to your model later
      location: countryDisplay,
      
      // Additional fields for reference
      providerId: provider.id,
      userId: userId,
      username: user.username || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      companyName: provider.company_name || "Company",
      category: provider.industry || "technology",
      jobs: provider.job_type || "full-time",
      email: provider.email_address || user.email || "",
      phone: provider.phone_number || "",
      description: provider.company_overview || "",
      country: provider.country || "usa",
    };
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

  // Apply filters
  const filteredProviders = jobProviders
    .map(transformJobProvider)
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

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption5 />
          <div className="row">
            {content.length > 0 ? (
              content
            ) : (
              <div className="col-12 text-center py-5">
                <p>No job providers match your filters.</p>
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