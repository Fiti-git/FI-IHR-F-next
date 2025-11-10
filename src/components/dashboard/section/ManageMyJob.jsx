"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";
import api from '@/lib/axios';

// Dummy applied job data (removed "On Going")
// const appliedJobs = [...] // Removed as we use the fetched data

// Status badge component for applicant statuses without "On Going"
const capitalizeFirst = (value) => {
  if (value == null) return "";
  const str = String(value).trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const ApplicantStatusBadge = ({ status }) => {
  let colorClass;
  switch (status) {
    case "closed":
      colorClass = "badge bg-danger";
      break;
    case "open":
      colorClass = "badge bg-success";
      break;
    case "Interview":
      colorClass = "badge bg-warning text-dark";
      break;
    case "Rejected":
      colorClass = "badge bg-danger";
      break;
    case "Hired":
      colorClass = "badge bg-success";
      break;
    default:
      colorClass = "badge bg-secondary";
  }
  return <span className={colorClass}>{capitalizeFirst(status)}</span>;
};

// Row component for Applied Jobs
function AppliedJobsRow({ job }) {
  // Ensure job.id is available, otherwise the 'View' link is broken
  const jobLink = job.id ? `/applied-jobs/${job.id}` : "#";
  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.category}</td>
      <td>{job.date}</td>
      <td>
        <ApplicantStatusBadge status={job.status} />
      </td>
      <td>
        <Link href={jobLink} className="btn btn-sm btn-outline-primary me-2">
          View
        </Link>
      </td>
    </tr>
  );
}

export default function AppliedJobs() {
  const [filter, setFilter] = useState("All");
  // 💡 RENAMED: Use freelancerUserId to align with correct API expectation (as per FreelancerDashboard.js)
  const [freelancerUserId, setFreelancerUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);


  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        let token = localStorage.getItem("access_token") || localStorage.getItem("token");

        if (!token) {
          setFetchError("No auth token found");
          setLoading(false);
          return;
        }

        const res = await api.get("/api/profile/freelancer/");
        const data = res.data;

        // Extract user ID from profile data
        let userId = null;
        if (Array.isArray(data) && data.length > 0) {
          userId = data[0].user?.id;
        }

        // If the API returns a single object { ..., user: { id: 123, ... } }
        if (data.user && data.user.id) {
          userId = data.user.id;
        }

        if (!userId) {
          setFetchError("Could not find User ID in profile data.");
          setLoading(false);
          return;
        }

        setFreelancerUserId(userId);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching freelancer profile:", err);
        setFetchError(err.response?.data?.message || String(err));
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, []);

  // When we have a freelancerUserId, fetch that freelancer's jobs
  useEffect(() => {
    const fetchFreelancerJobs = async () => {
      if (!freelancerUserId) return;

      setJobsLoading(true);
      setJobsError(null);
      try {
        let token = localStorage.getItem("access_token") || localStorage.getItem("token");
        if (!token) {
          setJobsError("No auth token found");
          setJobs([]);
          setJobsLoading(false);
          return;
        }

        const res = await api.get(`/api/freelance/${freelancerUserId}/`);
        const data = res.data;

        // API returns { freelance_id, jobs: [ { job_id, job_title, job_category, date_posted, job_status } ] }
        const mapped = Array.isArray(data.jobs)
          ? data.jobs.map((j) => ({
            id: j.job_id,
            title: j.job_title,
            category: j.job_category,
            date: j.date_posted,
            status: capitalizeFirst(j.job_status),
          }))
          : [];

        setJobs(mapped);
        setJobsLoading(false);
      } catch (err) {
        console.error("Error fetching freelancer jobs:", err);
        setJobsError(err.response?.data?.message || String(err));
        setJobs([]);
        setJobsLoading(false);
      }
    };

    fetchFreelancerJobs();
  }, [freelancerUserId]); //Retry



  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((job) => job.status === filter);

  // --- JSX REMAINS LARGELY THE SAME ---

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Applied Jobs</h2>
              <p className="text">Manage all your applied job listings and their statuses.</p>
              {/* Debug info hidden per request
          <p className="text-muted small">
           User ID: **{freelancerUserId || 'N/A'}** | 
           Profile Status: **{loading ? 'Fetching...' : fetchError ? 'Error' : 'Ready'}** | 
           Jobs Status: **{jobsLoading ? 'Fetching...' : jobsError ? 'Error' : `${jobs.length} jobs loaded`}**
          </p>
          */}
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link href="/jobs" className="ud-btn btn-dark default-box-shadow2">
                Browse Jobs <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              {/* Filter */}
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Applied Job Listings</h4>
                <select
                  className="form-select w-auto"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                  <option value="Interview">Interview</option>
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
                    {jobsLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Loading jobs...
                        </td>
                      </tr>
                    ) : jobsError ? (
                      <tr>
                        <td colSpan="5" className="text-center text-danger">
                          Error fetching jobs: {jobsError}
                        </td>
                      </tr>
                    ) : filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <AppliedJobsRow key={job.id} job={job} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No applied jobs found.
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