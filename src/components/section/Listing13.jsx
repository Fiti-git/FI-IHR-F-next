"use client";
import { useEffect, useState } from "react";
import listingStore from "@/store/listingStore";
import FreelancerCard1 from "../card/FreelancerCard1";
import ListingOption6 from "../element/ListingOption6";
import Pagination1 from "./Pagination1";
import priceStore from "@/store/priceStore";
import ListingSidebarModal5 from "../modal/ListingSidebarModal5";

export default function Listing13() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getLocation = listingStore((state) => state.getLocation);
  const getSearch = listingStore((state) => state.getSearch);
  const getLevel = listingStore((state) => state.getLevel);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  // Fetch all freelancer profiles from public API
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://206.189.134.117:8000/api/profile/freelancers/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched freelancers:", data);
          setFreelancers(data);
          setError(null);
        } else if (response.status === 404) {
          setFreelancers([]);
          setError("No freelancer profiles found");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching freelancers:", err);
        setError(err.message);
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  // Transform API data to match the format expected by FreelancerCard1
  const transformFreelancer = (freelancer) => {
    // Handle profile_image - if null, use default
    const imageUrl = freelancer.profile_image 
      ? (freelancer.profile_image.startsWith('http') 
          ? freelancer.profile_image 
          : `http://127.0.0.1:8000${freelancer.profile_image}`)
      : "/images/team/fl-1.png";

    // Extract user data from nested user object
    const user = freelancer.user || {};
    const userId = user.id;
    
    // Create display name from available user data
    const displayName = freelancer.full_name ||
      (user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}`.trim()
        : user.first_name || user.last_name || user.username || "Freelancer");

    // Parse hourly rate (remove $ and /hr)
    const hourlyRateValue = freelancer.hourly_rate 
      ? parseInt(freelancer.hourly_rate)
      : 0;

    // Format location
    const locationDisplay = freelancer.city && freelancer.country
      ? `${freelancer.city}, ${freelancer.country}`
      : freelancer.city || freelancer.country || "Location";

    // Parse skills
    const skillsArray = freelancer.skills 
      ? freelancer.skills.split(',').map(s => s.trim()).slice(0, 3)
      : [];

    return {
      // Fields that FreelancerCard1 expects
      id: userId,
      img: imageUrl,
      name: displayName,
      profession: freelancer.professional_title || "Professional",
      rating: "0.0",  // You can add rating to your model later
      reviews: "0",  // You can add reviews to your model later
      price: hourlyRateValue,
      skill: freelancer.specialization || "general",
      location: locationDisplay,
      level: freelancer.experience_level || "mid",
      language: freelancer.language || "english",
      
      // Additional fields for reference
      freelancerId: freelancer.id,
      userId: userId,
      username: user.username || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      fullName: freelancer.full_name || displayName,
      email: user.email || "",
      phone: freelancer.phone_number || "",
      bio: freelancer.bio || "",
      skills: skillsArray,
      hourlyRate: freelancer.hourly_rate,
      gender: freelancer.gender,
      city: freelancer.city,
      country: freelancer.country,
      languageProficiency: freelancer.language_proficiency,
      linkedinOrGithub: freelancer.linkedin_or_github,
    };
  };

  // Category filter (based on specialization/skill)
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.skill) : true;

  // Price filter
  const priceFilter = (item) =>
    priceRange.min <= item.price && priceRange.max >= item.price;

  // Location filter
  const locationFilter = (item) =>
    getLocation?.length !== 0
      ? getLocation.includes(item.location.split(" ").join("-").toLowerCase())
      : true;

  // Search filter
  const searchFilter = (item) =>
    getSearch !== ""
      ? item.location.toLowerCase().includes(getSearch.toLowerCase()) ||
        item.name.toLowerCase().includes(getSearch.toLowerCase()) ||
        item.profession.toLowerCase().includes(getSearch.toLowerCase())
      : true;

  // Level filter
  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : true;

  // Language filter
  const languageFilter = (item) =>
    getSpeak?.length !== 0
      ? getSpeak.includes(item.language.toLowerCase())
      : true;

  // Sort by filter
  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? true : item.sort === getBestSeller;

  // Apply filters
  const filteredFreelancers = freelancers
    .map(transformFreelancer)
    .filter(categoryFilter)
    .filter(priceFilter)
    .filter(locationFilter)
    .filter(searchFilter)
    .filter(levelFilter)
    .filter(languageFilter)
    .filter(sortByFilter);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem);

  // Content rendering
  const content = currentItems.map((item) => (
    <div key={`freelancer-${item.freelancerId}`} className="col-md-6 col-lg-4 col-xl-3">
      <FreelancerCard1 data={item} />
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
              <p className="mt-3">Loading freelancers...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && freelancers.length === 0) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption6 />
          <div className="row">
            <div className="col-12 text-center py-5">
              <div className="alert alert-warning" role="alert">
                <h4>No Freelancers Found</h4>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
        <ListingSidebarModal5 />
      </section>
    );
  }

  // Empty state
  if (freelancers.length === 0) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption6 />
          <div className="row">
            <div className="col-12 text-center py-5">
              <p>No freelancers available at the moment.</p>
            </div>
          </div>
        </div>
        <ListingSidebarModal5 />
      </section>
    );
  }

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <ListingOption6 />
          <div className="row">
            {content.length > 0 ? (
              content
            ) : (
              <div className="col-12 text-center py-5">
                <p>No freelancers match your filters.</p>
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