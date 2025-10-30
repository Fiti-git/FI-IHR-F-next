"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// Dummy applied job data (removed "On Going")
const appliedJobs = [
  { id: 1, title: "Frontend Developer", category: "Web Development", date: "2025-09-10", status: "Interview" },
  { id: 2, title: "UI/UX Designer", category: "Design", date: "2025-09-08", status: "Rejected" },
  { id: 3, title: "Backend Developer", category: "Web Development", date: "2025-09-01", status: "Interview" },
  { id: 4, title: "Marketing Specialist", category: "Marketing", date: "2025-08-28", status: "Hired" },
];

// Status badge component for applicant statuses without "On Going"
const ApplicantStatusBadge = ({ status }) => {
  let colorClass;
  switch (status) {
    case "Rejected":
      colorClass = "badge bg-danger";
      break;
    case "Hired":
      colorClass = "badge bg-success";
      break;
    case "Interview":
      colorClass = "badge bg-warning text-dark";
      break;
    default:
      colorClass = "badge bg-secondary";
  }
  return <span className={colorClass}>{status}</span>;
};

// Row component for Applied Jobs
function AppliedJobsRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.category}</td>
      <td>{job.date}</td>
      <td>
        <ApplicantStatusBadge status={job.status} />
      </td>
      <td>
        <Link href={`/applied-jobs/${job.id}`} className="btn btn-sm btn-outline-primary me-2">
          View
        </Link>
      </td>
    </tr>
  );
}

export default function AppliedJobs() {
  const [filter, setFilter] = useState("All");
  const [freelancerId, setFreelancerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
 

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        // Try the project's auth util first, then fall back to common localStorage keys
        let token = getAuthToken();
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        }

        if (!token) {
          setFetchError("No auth token found");
          setLoading(false);
          return;
        }

        // Use a relative path so the request goes to the same origin (or Next.js proxy)
        const res = await fetch("http://127.0.0.1:8000/api/profile/freelancer/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const msg = `Failed to fetch freelancer profile: ${res.status} ${res.statusText}`;
          console.error(msg, await res.text());
          setFetchError(msg);
          setLoading(false);
          return;
        }

        const data = await res.json();
        // Expecting an array; take the first object's id as freelancer id
        const id = Array.isArray(data) && data.length > 0 ? data[0].id : null;
        setFreelancerId(id);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching freelancer profile:", err);
        setFetchError(String(err));
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, []);

  // When we have a freelancerId, fetch that freelancer's jobs
  useEffect(() => {
    const fetchFreelancerJobs = async () => {
      if (!freelancerId) return;
      setJobsLoading(true);
      setJobsError(null);
      try {
        let token = getAuthToken();
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        }
        if (!token) {
          setJobsError("No auth token found");
          setJobs([]);
          setJobsLoading(false);
          return;
        }

        const res = await fetch(`http://127.0.0.1:8000/api/freelance/${freelancerId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          const msg = `Failed to fetch freelancer jobs: ${res.status} ${res.statusText}`;
          console.error(msg, txt);
          setJobsError(msg);
          setJobs([]);
          setJobsLoading(false);
          return;
        }

        const data = await res.json();
        // API returns { freelance_id, jobs: [ { job_id, job_title, job_category, date_posted, job_status } ] }
        const mapped = Array.isArray(data.jobs)
          ? data.jobs.map((j) => ({
              id: j.job_id,
              title: j.job_title,
              category: j.job_category,
              date: j.date_posted,
              status: j.job_status,
            }))
          : [];

        setJobs(mapped);
        setJobsLoading(false);
      } catch (err) {
        console.error("Error fetching freelancer jobs:", err);
        setJobsError(String(err));
        setJobs([]);
        setJobsLoading(false);
      }
    };

    fetchFreelancerJobs();
  }, [freelancerId]);

  

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
              <h2>Applied Jobs</h2>
              <p className="text">Manage all your applied job listings and their statuses.</p>
              {/* Freelancer ID display removed per request */}
              {/* (job numbers removed) */}
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
                    {filteredJobs.length > 0 ? (
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
