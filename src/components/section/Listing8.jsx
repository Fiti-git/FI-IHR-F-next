"use client";
import { useEffect, useState } from "react";
import ProjectCard1 from "../card/ProjectCard1";
import ListingOption2 from "../element/ListingOption2";
import ListingSidebar2 from "../sidebar/ListingSidebar2";
import Pagination1 from "./Pagination1";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import ListingSidebarModal2 from "../modal/ListingSidebarModal2";
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

export default function Listing8({ searchFilters }) {
  // State for API data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Store states for filters
  const getCategory = listingStore((state) => state.getCategory);
  const getProjectType = listingStore((state) => state.getProjectType);
  const getPrice = priceStore((state) => state.priceRange);
  const getDesginTool = listingStore((state) => state.getDesginTool);
  const getLocation = listingStore((state) => state.getLocation);
  const getSearch = listingStore((state) => state.getSearch);
  const getSpeak = listingStore((state) => state.getSpeak);
  const getBestSeller = listingStore((state) => state.getBestSeller);
  const getEnglishLevel = listingStore((state) => state.getEnglishLevel);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters]);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/project/projects/');
        console.log("Fetched projects:", response.data);

        // Transform API data to match ProjectCard1 structure
        const transformedProjects = response.data.map((project) => {
          // Handle image URL properly - use image_url from serializer or construct it
          const imageUrl = project.image_url
            || (project.image
              ? (project.image.startsWith('http')
                ? project.image
                : `${API_BASE_URL}${project.image}`)
              : null);

          // Handle user profile image
          const userProfileImage = project.user?.profile_image_url
            || (project.user?.profile_image
              ? (project.user.profile_image.startsWith('http')
                ? project.user.profile_image
                : `${API_BASE_URL}${project.user.profile_image}`)
              : "/images/team/default-avatar.png");

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            category: project.category,
            budget: parseFloat(project.budget),
            projectType: project.project_type,
            deadline: project.deadline,
            visibility: project.visibility,
            status: project.status,
            user: project.user,
            createdAt: project.created_at,
            updatedAt: project.updated_at,

            // Add fields that ProjectCard1 might expect
            price: {
              min: parseFloat(project.budget),
              max: parseFloat(project.budget)
            },
            location: project.user?.first_name || "Remote",
            skills: project.category || "",
            skill: [project.category] || [],
            tags: [project.category] || [],
            brief: project.description?.substring(0, 100) + "..." || "No description",
            language: "English",
            englishLevel: "Fluent",

            // Image field
            img: imageUrl || userProfileImage,
            imgUrl: imageUrl || userProfileImage,

            author: project.user?.username || "Anonymous",
            authorImg: userProfileImage,
            rating: 5.0,
            reviews: 0,
            jobDone: 0,

            // Original project data for reference
            originalData: project
          };
        });

        setProjects(transformedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // NEW: Breadcrumb search filter (searches across multiple fields)
  const breadcrumbSearchFilter = (item) => {
    if (!searchFilters || !searchFilters.keyword || searchFilters.keyword.trim() === '') {
      return true;
    }

    const keyword = searchFilters.keyword.toLowerCase().trim();

    // Search in these fields
    const searchableFields = [
      item.title,
      item.description,
      item.category,
      item.projectType,
      item.status,
      item.location,
      item.author,
      item.skills,
      item.brief
    ];

    return searchableFields.some(field =>
      field && field.toString().toLowerCase().includes(keyword)
    );
  };

  // Filter functions
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.category) : item;

  const projectTypeFilter = (item) =>
    getProjectType?.length !== 0
      ? getProjectType.includes(item.projectType)
      : item;

  const priceFilter = (item) =>
    getPrice.min <= item.price.min && getPrice.max >= item.price.max;

  const skillFilter = (item) =>
    getDesginTool?.length !== 0
      ? getDesginTool.includes(item.skills.split(" ").join("-").toLowerCase())
      : item;

  const locationFilter = (item) =>
    getLocation?.length !== 0
      ? getLocation.includes(item.location.split(" ").join("-").toLowerCase())
      : item;

  const searchFilter = (item) =>
    getSearch !== ""
      ? item.title?.toLowerCase().includes(getSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(getSearch.toLowerCase()) ||
      item.location
        ?.split("-")
        .join(" ")
        .toLowerCase()
        .includes(getSearch.toLowerCase())
      : item;

  const speakFilter = (item) =>
    getSpeak?.length !== 0
      ? getSpeak.includes(item.language.split(" ").join("-").toLowerCase())
      : item;

  const englishLevelFilter = (item) =>
    getEnglishLevel?.length !== 0
      ? getEnglishLevel.includes(item.englishLevel)
      : item;

  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? item : item.sort === getBestSeller;

  // Apply all filters to projects
  const filteredProjects = projects
    .filter(breadcrumbSearchFilter)  // NEW: Apply breadcrumb search first
    .filter(categoryFilter)
    .filter(projectTypeFilter)
    .filter(priceFilter)
    .filter(skillFilter)
    .filter(locationFilter)
    .filter(searchFilter)
    .filter(speakFilter)
    .filter(englishLevelFilter)
    .filter(sortByFilter);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  // Render content
  let content;

  if (loading) {
    content = (
      <div className="col-12 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading projects...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="col-12">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  } else if (currentItems.length === 0) {
    const isSearchActive = searchFilters && searchFilters.keyword;
    content = (
      <div className="col-12 text-center py-5">
        <div className="text-muted">
          {projects.length === 0 ? (
            <>
              <i className="flaticon-folder fz60 mb-3 d-block"></i>
              <h5>No projects available at the moment.</h5>
              <p>Check back later for new opportunities!</p>
            </>
          ) : (
            <>
              <i className="flaticon-search fz60 mb-3 d-block"></i>
              <h5>No projects found</h5>
              <p>
                {isSearchActive
                  ? `No results found for "${searchFilters.keyword}". Try different keywords or adjust your filters.`
                  : "Try adjusting your filters to see more results."}
              </p>
            </>
          )}
        </div>
      </div>
    );
  } else {
    content = currentItems.map((item) => (
      <div key={item.id} className="col-md-6 col-lg-12">
        <ProjectCard1 data={item} />
      </div>
    ));
  }

  // Check if search is active
  const isSearchActive = searchFilters && searchFilters.keyword;

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <ListingSidebar2 />
            </div>
            <div className="col-lg-9">
              {/* Search Results Info */}
              {isSearchActive && (
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                      <span>
                        Found <strong>{filteredProjects.length}</strong> project{filteredProjects.length !== 1 ? 's' : ''}
                        {searchFilters.keyword && ` for "${searchFilters.keyword}"`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <ListingOption2 itemLength={filteredProjects?.length || 0} />
              <div className="row">{content}</div>
              {!loading && !error && filteredProjects.length > itemsPerPage && (
                <div className="mt30">
                  <Pagination1
                    totalItems={filteredProjects.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <ListingSidebarModal2 />
    </>
  );
}