"use client";
import { useEffect, useState } from "react";
import ListingOption4 from "../element/ListingOption4";
import Pagination1 from "./Pagination1";
import JobCard4 from "../card/JobCard4";
import listingStore from "@/store/listingStore";
import priceStore from "@/store/priceStore";
import ListingSidebarModal3 from "../modal/ListingSidebarModal3";

export default function Listing9() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 items per page (3 rows x 4 columns)

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getJobType = listingStore((state) => state.getJobType);
  const getLevel = listingStore((state) => state.getLevel);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("/api/job-posting/");
        console.log('API Response:', response.data);

        const jobsArray = Array.isArray(response.data) ? response.data :
          response.data.results ? response.data.results :
            response.data.jobs ? response.data.jobs :
              response.data.data ? response.data.data : [];

        console.log('Jobs Array:', jobsArray);

        const transformedJobs = jobsArray.map(job => ({
          id: job.job_id || job.id,
          img: "/images/team/client-2.png",
          title: job.job_title || job.title,
          server:
            typeof job.job_category === "string" && job.job_category.length > 0
              ? job.job_category[0].toUpperCase() + job.job_category.slice(1)
              : "General",
          benefits: [
            job.salary_range,
            job.work_mode || 'Full Time',
            job.location || 'Not Specified',
            job.remote_work ? "Remote" : "On-site"
          ],
          category: job.category || "General",
          salary: parseInt(job.salary_from) || 0,
          jobType: job.job_type || job.jobType || "Full Time",
          level: "new",
          sort: "new-arrivals"
        }));

        console.log('Transformed Jobs:', transformedJobs);
        setJobs(transformedJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.response?.data?.message || error.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [getCategory, priceRange, getJobType, getLevel, getBestSeller]);

  // Filter functions
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.category) : item;

  const salaryFilter = (item) =>
    priceRange.min <= item.salary && priceRange.max >= item.salary;

  const jobTypeFilter = (item) =>
    getJobType?.length !== 0 ? getJobType.includes(item.jobType) : item;

  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : item;

  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? item : item.sort === getBestSeller;

  // Apply all filters
  const filteredJobs = jobs
    .filter(categoryFilter)
    .filter(salaryFilter)
    .filter(jobTypeFilter)
    .filter(levelFilter)
    .filter(sortByFilter);

  // Calculate pagination
  const totalItems = filteredJobs.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of listing section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-auto">
            <div className="p-5">Loading jobs...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          Error loading jobs: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="pt40 pb90">
        <div className="container">
          <ListingOption4 />
          <div className="row">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((item, i) => (
                <div key={i} className="col-sm-6 col-lg-4 col-xl-3">
                  <JobCard4 data={item} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="text-center p-5">
                  <p>No jobs found matching your criteria.</p>
                </div>
              </div>
            )}
          </div>
          {filteredJobs.length > 0 && (
            <div className="mt30">
              <Pagination1
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                maxVisiblePages={5}
              />
            </div>
          )}
        </div>
      </section>
      <ListingSidebarModal3 />
    </>
  );
}