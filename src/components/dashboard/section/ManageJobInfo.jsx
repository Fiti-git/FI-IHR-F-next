"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";
import { useRouter } from "next/navigation"; // Next.js 13+ app router
import api from '@/lib/axios';

// Fetch jobs function
const fetchJobs = async (access_token) => {
  if (!access_token) {
    return { jobs: [], unauthorized: true }; // signal to redirect
  }

  try {
    const response = await api.get("/api/job-posting/");

    // Handle different response formats
    const data = response.data;
    const jobsArray =
      Array.isArray(data) ? data :
        data.jobs ? data.jobs :
          data.results ? data.results :
            data.data ? data.data : [];

    const jobsData = jobsArray.map((job) => ({
      id: job.job_id || job.id,
      title: job.job_title,
      category: job.job_category,
      date: job.date_posted,
      status: job.job_status || "Open",
      salary: job.salary_range,
      location: job.location,
    }));

    return { jobs: jobsData, unauthorized: false };
  } catch (error) {
    console.error("Error fetching jobs:", error);

    if (error.response?.status === 401) {
      return { jobs: [], unauthorized: true };
    }

    return { jobs: [], unauthorized: false };
  }
};

// Status badge component
const StatusBadge = ({ status }) => {
  const raw = (status ?? "").toString().trim();
  const key = raw.toLowerCase();

  const colorClass = (() => {
    switch (key) {
      case "open":
        return "pending-style style1"; // Yellow/Orange background
      case "closed":
        return "pending-style style3"; // Pink/Red background
      case "pending":
      case "in review":
      case "in-review":
        return "pending-style style1"; // Yellow/Orange background
      case "draft":
        return "pending-style style4"; // Dark background
      case "paused":
        return "pending-style style2"; // Light blue background
      case "filled":
      case "completed":
        return "pending-style style2"; // Light blue background
      default:
        return "pending-style style5"; // Light orange background
    }
  })();

  const label = raw
    ? raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "Unknown";

  return <span className={colorClass}>{label}</span>;
};

// Row component for Posted Jobs
function PostedJobsRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>
        {typeof job.category === "string" && job.category.length > 0
          ? job.category[0].toUpperCase() + job.category.slice(1)
          : job.category}
      </td>
      <td>{job.date ? new Date(job.date).toLocaleDateString() : "N/A"}</td>
      <td>
        <StatusBadge status={job.status} />
      </td>
      <td>
        <Link
          href={`/jobs/${job.id}`}
          className="ud-btn btn-thm"
          style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
          title="View Details"
        >
          <i className="fal fa-eye" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }}></i>
        </Link>
      </td>
    </tr>
  );
}

// Main Component
export default function PostedJobs() {
  const [filter, setFilter] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);

      let access_token;
      if (typeof window !== "undefined") {
        access_token = localStorage.getItem("access_token");
      }

      const { jobs: jobsData, unauthorized } = await fetchJobs(access_token);

      if (unauthorized) {
        router.push("/login"); // redirect if no token or invalid
        return;
      }

      setJobs(jobsData);
      setLoading(false);
    };

    loadJobs();
  }, [router]);

  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Posted Jobs</h2>
              <p className="text">Manage all your posted job listings.</p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link
                href="/create-jobs"
                className="ud-btn btn-dark default-box-shadow2"
              >
                Post Job <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              {/* Filter */}
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Job Listings</h4>
                <select
                  className="form-select w-auto"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Jobs Table */}
              <div className="packages_table table-responsive">
                <table className="table-style3 table at-savesearch">
                  <thead className="t-head">
                    <tr>
                      <th>Job Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Loading jobs...
                        </td>
                      </tr>
                    ) : filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <PostedJobsRow key={job.id} job={job} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No jobs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt30">
                <Pagination1 />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}
