"use client";
import { useEffect, useState } from "react";
import listingStore from "@/store/listingStore";
import FreelancerCard1 from "../card/FreelancerCard1";
import ListingOption6 from "../element/ListingOption6";
import Pagination1 from "./Pagination1";
import priceStore from "@/store/priceStore";
import ListingSidebarModal5 from "../modal/ListingSidebarModal5";
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

export default function Listing13({ searchFilters }) {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Global Filter States (usually coming from Sidebar)
  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getLocation = listingStore((state) => state.getLocation);
  const getSearch = listingStore((state) => state.getSearch);
  const getLevel = listingStore((state) => state.getLevel);
  const getSpeak = listingStore((state) => state.getSpeak);
  // const getBestSeller = listingStore((state) => state.getBestSeller);

  // Reset to page 1 when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters, getCategory, getLocation, getLevel, getSpeak]);

  // Fetch all freelancer profiles from API
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        // Using the API endpoint you provided
        const response = await api.get("/api/profile/freelancers/");
        
        // Handle response whether it is an array or a paginated object
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        setFreelancers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching freelancers:", err);
        setFreelancers([]);
        setError(err.response?.data?.message || "Failed to load freelancers");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  // --- DATA TRANSFORMATION ---
  // Maps your specific API fields to the format the UI and Filters expect
  const transformFreelancer = (freelancer) => {
    const user = freelancer.user || {};

    // 1. Image Handling
    const imageUrl = freelancer.profile_image_url
      || (freelancer.profile_image
        ? (freelancer.profile_image.startsWith('http') ? freelancer.profile_image : `${API_BASE_URL}${freelancer.profile_image}`)
        : "/images/team/fl-1.png");

    // 2. Name Handling
    const displayName = freelancer.full_name || 
      (user.first_name ? `${user.first_name} ${user.last_name}` : user.username) || 
      "Freelancer";

    // 3. Skills Handling
    // API returns 'skills_list' (array) and 'skills' (string)
    let skillsArray = [];
    if (freelancer.skills_list && freelancer.skills_list.length > 0) {
      skillsArray = freelancer.skills_list;
    } else if (freelancer.skills && typeof freelancer.skills === 'string') {
      skillsArray = freelancer.skills.split(',').map(s => s.trim());
    }

    // 4. Specialization Display
    const specializationDisplay = freelancer.specialization 
      ? freelancer.specialization.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) // "web-dev" -> "Web Dev"
      : 'General';

    // 5. Level Display
    const levelDisplay = freelancer.experience_level 
      ? freelancer.experience_level.charAt(0).toUpperCase() + freelancer.experience_level.slice(1) // "mid" -> "Mid"
      : 'Mid Level';

    return {
      // --- Core Fields for Filtering ---
      id: user.id || freelancer.id,
      freelancerId: freelancer.id,
      
      // Price Filter: API returns string "30", convert to Number
      price: parseFloat(freelancer.hourly_rate) || 0,
      
      // Category Filter: maps to 'specialization' (e.g., "web-dev")
      skill: freelancer.specialization || "web development", 
      
      // Location Filter: maps to 'city' (e.g., "london")
      location: freelancer.city || freelancer.country || "london",
      
      // Level Filter: maps to 'experience_level' (e.g., "mid")
      level: freelancer.experience_level || "mid",
      
      // Language Filter: maps to 'language' (e.g., "english")
      language: freelancer.language || "english",

      // --- Fields for Display Card ---
      img: imageUrl,
      name: displayName,
      profession: freelancer.professional_title || "Freelancer",
      rating: "5.0", // Hardcoded as API doesn't have rating yet
      reviews: "0",  // Hardcoded as API doesn't have reviews yet
      hourlyRate: freelancer.hourly_rate || "0",
      
      // Searchable text fields
      skillDisplay: specializationDisplay,
      levelDisplay: levelDisplay,
      skillsString: skillsArray.join(', '),
      bio: freelancer.bio || "",
      city: freelancer.city,
      country: freelancer.country,
      sort: "best-seller" // Default sort key
    };
  };

  // --- FILTERS ---

  // 1. Breadcrumb Search (Keyword Search)
  const breadcrumbSearchFilter = (item) => {
    if (!searchFilters || !searchFilters.keyword || searchFilters.keyword.trim() === '') {
      return true;
    }
    const keyword = searchFilters.keyword.toLowerCase().trim();
    
    // Fields to search in
    const searchFields = [
      item.name, 
      item.profession, 
      item.skillsString, 
      item.skillDisplay, 
      item.location,
      item.city,
      item.country
    ];

    return searchFields.some(field => 
      field && field.toString().toLowerCase().includes(keyword)
    );
  };

  // 2. Category Filter (Matches API 'specialization')
  // Sidebar usually sends keys like "web-dev", "design".
  const categoryFilter = (item) => {
    if (!getCategory || getCategory.length === 0) return true;
    // We lowercase both to ensure "Web-Dev" matches "web-dev"
    return getCategory.some(cat => cat.toLowerCase() === item.skill.toLowerCase());
  };

  // 3. Price Filter (Matches API 'hourly_rate')
  const priceFilter = (item) =>
    priceRange.min <= item.price && priceRange.max >= item.price;

  // 4. Location Filter (Matches API 'city')
  // Note: Sidebar usually sends slugified cities (e.g., "london", "new-york")
  const locationFilter = (item) => {
    if (!getLocation || getLocation.length === 0) return true;
    
    // Normalize item location to match sidebar format (lowercase, dashes for spaces)
    const itemLocationSlug = item.location.toLowerCase().split(" ").join("-");
    
    return getLocation.includes(itemLocationSlug);
  };

  // 5. Sidebar Search Input Filter
  const searchFilter = (item) =>
    getSearch !== ""
      ? item.location.toLowerCase().includes(getSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(getSearch.toLowerCase()) ||
        item.profession.toLowerCase().includes(getSearch.toLowerCase())
      : true;

  // 6. Level Filter (Matches API 'experience_level')
  const levelFilter = (item) => {
    if (!getLevel || getLevel.length === 0) return true;
    // Compare "mid" with ["mid", "senior"]
    return getLevel.some(l => l.toLowerCase() === item.level.toLowerCase());
  };

  // 7. Language Filter (Matches API 'language')
  const languageFilter = (item) => {
    if (!getSpeak || getSpeak.length === 0) return true;
    return getSpeak.some(lang => lang.toLowerCase() === item.language.toLowerCase());
  };

  // Sort by filter
  // const sortByFilter = (item) =>
  //   getBestSeller === "best-seller" ? true : item.sort === getBestSeller;

  // --- APPLY FILTERS ---
  const filteredFreelancers = freelancers
    .map(transformFreelancer)
    .filter(breadcrumbSearchFilter)
    .filter(categoryFilter)
    .filter(priceFilter)
    .filter(locationFilter)
    .filter(searchFilter)
    .filter(levelFilter)
    .filter(languageFilter)
   // .filter(sortByFilter);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem);

  const content = currentItems.map((item) => (
    <div key={`freelancer-${item.freelancerId}`} className="col-md-6 col-lg-4 col-xl-3">
      <FreelancerCard1 data={item} />
    </div>
  ));

  // Loading View
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

  // Check if search/filter is active
  const isSearchActive = (searchFilters && searchFilters.keyword) || 
                         (getCategory.length > 0) || 
                         (getLocation.length > 0) || 
                         (getSearch !== "");

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          {/* Result Count Info */}
          <div className="row mb-3">
             <div className="col-12">
               {isSearchActive && (
                 <p className="text-muted">
                   Found <strong>{filteredFreelancers.length}</strong> freelancer{filteredFreelancers.length !== 1 ? 's' : ''} matching your criteria.
                 </p>
               )}
             </div>
          </div>

          <ListingOption6 />
          
          <div className="row">
            {content.length > 0 ? (
              content
            ) : (
              <div className="col-12 text-center py-5">
                <div className="alert alert-warning">
                  <h5>No Freelancers Found</h5>
                  <p>
                    {isSearchActive
                      ? "No freelancers match your current filters. Try removing some filters."
                      : "No freelancer profiles available at the moment."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {filteredFreelancers.length > itemsPerPage && (
            <div className="row mt30">
              <Pagination1
                totalItems={filteredFreelancers.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </section>
      <ListingSidebarModal5 />
    </>
  );
}