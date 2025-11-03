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

  const getCategory = listingStore((state) => state.getCategory);
  const priceRange = priceStore((state) => state.priceRange);
  const getJobType = listingStore((state) => state.getJobType);
  const getLevel = listingStore((state) => state.getLevel);
  const getBestSeller = listingStore((state) => state.getBestSeller);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let accessToken;
        if (typeof window !== 'undefined') {
          accessToken = localStorage.getItem("accessToken");
        }

        const response = await fetch("http://206.189.134.117:8000/api/job-posting/", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "Authorization": accessToken ? `Bearer ${accessToken}` : ''
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug the API response

        // Check if data is an array or if it's nested in a property
        const jobsArray = Array.isArray(data) ? data : 
                         data.results ? data.results : 
                         data.jobs ? data.jobs : 
                         data.data ? data.data : [];
        
        console.log('Jobs Array:', jobsArray); // Debug the jobs array

        // Transform API data to match the expected format
        const transformedJobs = jobsArray.map(job => ({
          id: job.job_id || job.id,
          img: "/images/team/client-2.png", // default image
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
          level: "new", // Default level
          sort: "new-arrivals"
        }));

        console.log('Transformed Jobs:', transformedJobs); // Debug the transformed data
        setJobs(transformedJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // category filter
  const categoryFilter = (item) =>
    getCategory?.length !== 0 ? getCategory.includes(item.category) : item;

  // salary filter
  const salaryFilter = (item) =>
    priceRange.min <= item.salary && priceRange.max >= item.salary;

  // job type filter
  const jobTypeFilter = (item) =>
    getJobType?.length !== 0 ? getJobType.includes(item.jobType) : item;

  // level filter
  const levelFilter = (item) =>
    getLevel?.length !== 0 ? getLevel.includes(item.level) : item;

  // sort by filter
  const sortByFilter = (item) =>
    getBestSeller === "best-seller" ? item : item.sort === getBestSeller;

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
            {jobs
              .filter(categoryFilter)
              .filter(salaryFilter)
              .filter(jobTypeFilter)
              .filter(levelFilter)
              .filter(sortByFilter)
              .map((item, i) => (
                <div key={i} className="col-sm-6 col-lg-4 col-xl-3">
                  <JobCard4 data={item} />
                </div>
              ))}
          </div>
          <div className="mt30">
            <Pagination1 />
          </div>
        </div>
      </section>
      <ListingSidebarModal3 />
    </>
  );
}
