"use client";
import { useEffect, useState } from "react";
import ListingOption4 from "../element/ListingOption4";
import Pagination1 from "./Pagination1";
import JobCard4 from "../card/JobCard4";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import ListingSidebarModal3 from "../modal/ListingSidebarModal3";

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

export default function Listing9() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getJobType = listingStore((state) => state.getJobType);
  // const getLevel = listingStore((state) => state.getLevel);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  /* --------------------------------------------------------------
     FETCH + TRANSFORM
     -------------------------------------------------------------- */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(
          "http://206.189.134.117:8000/api/job-posting/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
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
              job.work_mode || "Full Time",
              job.location || "Not Specified",
              job.remote_work ? "Remote" : "On-site",
            ],
            category: (job.job_category || "general").toLowerCase(),
            salaryMin,
            salaryMax,
            salary: salaryMin,               // kept for backward compat
            jobType: job.job_type || "Full Time",
            level: "new",
            sort: "new-arrivals",
          };
        });

        setJobs(transformedJobs);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
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

  // ----------  FIXED SALARY FILTER  ----------
  const salaryFilter = (item) => {
    const userMin = priceRange.min;
    const userMax = priceRange.max;

    if (userMin === 0 && userMax === Infinity) return true; // no filter

    const jobMin = item.salaryMin ?? 0;
    const jobMax = item.salaryMax ?? Infinity;

    // Job range must be **inside** the user range
    return jobMin >= userMin && jobMax <= userMax;
  };

  const jobTypeFilter = (item) =>
    getJobType?.length ? getJobType.includes(item.jobType) : true;

  // const levelFilter = (item) =>
  //   getLevel?.length ? getLevel.includes(item.level) : true;

  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? true : item.sort === getBestSeller;

  /* --------------------------------------------------------------
     RENDER
     -------------------------------------------------------------- */
  if (loading)
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-auto p-5">Loading jobs...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container">
        <div className="alert alert-danger">Error loading jobs: {error}</div>
      </div>
    );

  const filtered = jobs
    .filter(categoryFilter)
    .filter(salaryFilter)
    .filter(jobTypeFilter)
    // .filter(levelFilter)  
    .filter(sortByFilter);

  return (
    <>
      <section className="pt40 pb90">
        <div className="container">
          <ListingOption4 />
          <div className="row">
            {filtered.length ? (
              filtered.map((item, i) => (
                <div key={i} className="col-sm-6 col-lg-4 col-xl-3">
                  <JobCard4 data={item} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No jobs match your filters.</p>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
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