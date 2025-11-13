"use client";
import { useEffect, useState } from "react";
import ListingOption4 from "../element/ListingOption4";
import Pagination1 from "./Pagination1";
import JobCard4 from "../card/JobCard4";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
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

export default function Listing9() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getJobType = listingStore((state) => state.getJobType);
  const getBestSeller = listingStore((state) => state.getBestSeller);

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

  /* --------------------------------------------------------------
     RENDER
     -------------------------------------------------------------- */
  if (loading)
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container">
        <div className="alert alert-danger mt-4">Error loading jobs: {error}</div>
      </div>
    );

  const filtered = jobs
    .filter(categoryFilter)
    .filter(salaryFilter)
    .filter(jobTypeFilter)
    .filter(sortByFilter);

  return (
    <>
      <section className="pt40 pb90">
        <div className="container">
          <ListingOption4 itemTytle={"Jobs"} />
          <div className="row">
            {filtered.length > 0 ? (
              filtered.map((item, i) => (
                <div key={i} className="col-sm-6 col-lg-4 col-xl-3">
                  <JobCard4 data={item} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p className="text-muted lead">No jobs match your filters.</p>
              </div>
            )}
          </div>

          {filtered.length > itemsPerPage && ( // Only show pagination if there's more than one page
            <div className="mt30">
              <Pagination1 />
            </div>
          )}
        </div>
      </section>

      <ListingSidebarModal3 />
    </>
  );
}