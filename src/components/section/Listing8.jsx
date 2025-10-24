"use client";
import { useEffect, useState } from "react";
import ProjectCard1 from "../card/ProjectCard1";
import ListingOption2 from "../element/ListingOption2";
import ListingSidebar2 from "../sidebar/ListingSidebar2";
import Pagination1 from "./Pagination1";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import ListingSidebarModal2 from "../modal/ListingSidebarModal2";

export default function Listing8() {
  // State for API data
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project/projects/";

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched projects:", data);
        
        // Transform API data to match ProjectCard1 structure
        const transformedProjects = data.map((project) => ({
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
          skill: [project.category] || [], // Array format
          tags: [project.category] || [], // Tags array
          brief: project.description?.substring(0, 100) + "..." || "No description",
          language: "English",
          englishLevel: "Fluent",
          
          // Image field - use project image if exists, otherwise use user avatar or default
          img: project.image || project.user?.profile_image || "/images/team/default-avatar.png",
          imgUrl: project.image || project.user?.profile_image || "/images/team/default-avatar.png",
          
          author: project.user?.username || "Anonymous",
          authorImg: project.user?.profile_image || "/images/team/default-avatar.png",
          rating: 5.0,
          reviews: 0,
          jobDone: 0,
          
          // Original project data for reference
          originalData: project
        }));

        setProjects(transformedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
    .filter(categoryFilter)
    .filter(projectTypeFilter)
    .filter(priceFilter)
    .filter(skillFilter)
    .filter(locationFilter)
    .filter(searchFilter)
    .filter(speakFilter)
    .filter(englishLevelFilter)
    .filter(sortByFilter);

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
  } else if (filteredProjects.length === 0) {
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
              <h5>No projects found matching your criteria.</h5>
              <p>Try adjusting your filters to see more results.</p>
            </>
          )}
        </div>
      </div>
    );
  } else {
    content = filteredProjects.map((item) => (
      <div key={item.id} className="col-md-6 col-lg-12">
        <ProjectCard1 data={item} />
      </div>
    ));
  }

  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <ListingSidebar2 />
            </div>
            <div className="col-lg-9">
              <ListingOption2 itemLength={filteredProjects?.length || 0} />
              <div className="row">{content}</div>
              {!loading && !error && filteredProjects.length > 0 && (
                <div className="mt30">
                  <Pagination1 />
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