"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

const fetchJobs = async () => {
  try {
    let accessToken;
    
    // Get token safely in client-side
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem("accessToken");
    }

    if (!accessToken) {
      console.error('No access token found');
      return [];
    }

    const response = await fetch("http://127.0.0.1:8000/api/job-manage/", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match the component's expected format
    return data.jobs.map(job => ({
      id: job.job_id,
      title: job.job_title,
      category: job.job_category,
      date: job.date_posted,
      status: job.job_status || "Open", // Default to "Open" if status is not provided
      salary: job.salary_range,
      location: job.location
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

// Icon button component for consistent style
const IconButton = ({ onClick, title, iconClass, colorClass }) => (
  <button
    onClick={onClick}
    title={title}
    className={`btn btn-icon btn-sm ${colorClass || "btn-primary"} me-2`}
    style={{ border: "none", background: "transparent", cursor: "pointer" }}
  >
    <i className={iconClass} />
  </button>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const raw = (status ?? '').toString().trim();
  const key = raw.toLowerCase();

  const colorClass = (() => {
    switch (key) {
      case 'open':
        return 'badge bg-success'; // green
      case 'closed':
        return 'badge bg-danger'; // red
      case 'pending':
      case 'in review':
      case 'in-review':
        return 'badge bg-warning text-dark'; // yellow
      case 'draft':
        return 'badge bg-secondary'; // gray
      case 'paused':
        return 'badge bg-info text-dark'; // light blue
      case 'filled':
        return 'badge bg-primary'; // blue
      default:
        return 'badge bg-secondary';
    }
  })();

  const label = raw
    ? raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Unknown';

  return <span className={colorClass}>{label}</span>;
};

// Row component for Posted Jobs
function PostedJobsRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>{
        typeof job.category === 'string' && job.category.length > 0
          ? job.category[0].toUpperCase() + job.category.slice(1)
          : job.category
      }</td>
      <td>{job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}</td>
      <td>
        <StatusBadge status={job.status} />
      </td>
      <td>
        <Link href={`/jobs/${job.id}`} className="btn btn-sm btn-outline-primary me-2">
          View
        </Link>
      </td>
    </tr>
  );
}

export default function PostedJobs() {
  const [filter, setFilter] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      const jobsData = await fetchJobs();
      setJobs(jobsData);
      setLoading(false);
    };

    loadJobs();
  }, []);

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
              <Link href="/create-jobs" className="ud-btn btn-dark default-box-shadow2">
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
