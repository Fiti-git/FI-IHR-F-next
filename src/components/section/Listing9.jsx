"use client";
import { useEffect, useState } from "react";
import ListingOption2 from "../element/ListingOption2";
import Pagination1 from "./Pagination1";
import JobCard4 from "../card/JobCard4";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import ListingSidebar3 from "../sidebar/ListingSidebar3";
import ListingSidebarModal3 from "../modal/ListingSidebarModal3";
import api from "@/lib/axios"; // Import the centralized Axios instance

/* --------------------------------------------------------------
   Helper – parse "1.00 - 1,000.00 USD"
   -------------------------------------------------------------- */
const parseSalaryRange = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== "string") return { min: 0, max: Infinity };
  const cleaned = rangeStr.replace(/USD/gi, "").trim();
  const match = cleaned.match(/([\d,]+\.?\d*)\s*-\s*([\d,]+\.?\d*)/);
  if (!match) return { min: 0, max: Infinity };
  const min = parseFloat(match[1].replace(/,/g, ""));
  const max = parseFloat(match[2].replace(/,/g, ""));
  return { min: isNaN(min) ? 0 : min, max: isNaN(max) ? Infinity : max };
};

// Capitalize only the first letter of a string (leave the rest as-is)
const capitalizeFirst = (s) => (typeof s === 'string' && s.length) ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export default function Listing9({ searchFilters }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getJobType = listingStore((state) => state.getJobType);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  // Reset to page 1 when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters]);

  /* --------------------------------------------------------------
     FETCH + TRANSFORM
     -------------------------------------------------------------- */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Use the centralized api instance. Base URL and headers are handled automatically.
        const response = await api.get("/api/job-posting/");

        // Axios provides the JSON data directly in the `data` property
        const data = response.data;
        const jobsArray =
          Array.isArray(data) ? data :
            data.jobs ? data.jobs :
              data.results ? data.results :
                data.data ? data.data : [];

        const transformedJobs = jobsArray.map((job) => {
          const { min: salaryMin, max: salaryMax } = parseSalaryRange(job.salary_range);

          return {
            id: job.job_id || job.id,
            img: "/images/team/client-2.png",
            title: job.job_title || "Untitled Job",
            server:
              typeof job.job_category === "string" && job.job_category.length
                ? job.job_category.charAt(0).toUpperCase() +
                job.job_category.slice(1).toLowerCase()
                : "General",
            benefits: [
              job.salary_range || "Not specified",
              capitalizeFirst(job.job_type || "Full Time"),
              job.location || "Not Specified",
              job.remote_work ? "Remote" : "On-site",
            ],
            category: (job.job_category || "general").toLowerCase(),
            salaryMin,
            salaryMax,
            salary: salaryMin,
            jobType: capitalizeFirst(job.job_type || "Full Time"),
            level: "new",
            sort: "new-arrivals",
          };
        });

        setJobs(transformedJobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        // Use the error object from Axios for more specific messages
        setError(err.response?.data?.detail || err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  /* --------------------------------------------------------------
     FILTERS
     -------------------------------------------------------------- */
  // NEW: Breadcrumb search filter (searches across multiple fields)
  const breadcrumbSearchFilter = (item) => {
    if (!searchFilters || !searchFilters.keyword || searchFilters.keyword.trim() === '') {
      return true;
    }

    const keyword = searchFilters.keyword.toLowerCase().trim();

    // Search in these fields
    const searchableFields = [
      item.title,
      item.server,
      item.category,
      item.jobType,
      item.benefits?.join(' ')
    ];

    return searchableFields.some(field =>
      field && field.toString().toLowerCase().includes(keyword)
    );
  };

  const categoryFilter = (item) =>
    getCategory?.length ? getCategory.includes(item.category) : true;

  const salaryFilter = (item) => {
    const userMin = priceRange.min;
    const userMax = priceRange.max;
    if (userMin === 0 && userMax === Infinity) return true;
    const jobMin = item.salaryMin ?? 0;
    const jobMax = item.salaryMax ?? Infinity;
    return jobMin >= userMin && jobMax <= userMax;
  };

  const jobTypeFilter = (item) =>
    getJobType?.length ? getJobType.includes(item.jobType) : true;

  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? true : item.sort === getBestSeller;

  // Apply all filters
  const filteredJobs = jobs
    .filter(breadcrumbSearchFilter)  // NEW: Apply breadcrumb search first
    .filter(categoryFilter)
    .filter(salaryFilter)
    .filter(jobTypeFilter)
    .filter(sortByFilter);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  // Render content
  let content;

  if (loading) {
    content = (
      <div className="col-12 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading jobs...</p>
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
          {jobs.length === 0 ? (
            <>
              <i className="flaticon-folder fz60 mb-3 d-block"></i>
              <h5>No jobs available at the moment.</h5>
              <p>Check back later for new opportunities!</p>
            </>
          ) : (
            <>
              <i className="flaticon-search fz60 mb-3 d-block"></i>
              <h5>No jobs found</h5>
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
        <JobCard4 data={item} />
      </div>
    ));
  }

  // Check if search is active
  const isSearchActive = searchFilters && searchFilters.keyword;

  /* --------------------------------------------------------------
     RENDER
     -------------------------------------------------------------- */
  return (
    <>
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <ListingSidebar3 />
            </div>
            <div className="col-lg-9">
              {/* Search Results Info */}
              {isSearchActive && (
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                      <span>
                        Found <strong>{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? 's' : ''}
                        {searchFilters.keyword && ` for "${searchFilters.keyword}"`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <ListingOption2 itemLength={filteredJobs?.length || 0} />
              <div className="row">{content}</div>
              {!loading && !error && filteredJobs.length > itemsPerPage && (
                <div className="mt30">
                  <Pagination1
                    totalItems={filteredJobs.length}
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

      <ListingSidebarModal3 />
    </>
  );
}