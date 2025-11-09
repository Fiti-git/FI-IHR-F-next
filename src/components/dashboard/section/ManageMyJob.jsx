"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// Dummy applied job data (removed "On Going")
// const appliedJobs = [...] // Removed as we use the fetched data

// Status badge component for applicant statuses without "On Going"
const capitalizeFirst = (value) => {
  if (value == null) return "";
  const str = String(value).trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Normalize status strings the same way as ManageappliedJobInfo.jsx
const normalizeStatus = (s) => {
  if (!s) return "";
  const v = String(s).trim().toLowerCase();
  if (v.includes("reject")) return "Rejected";
  if (v.includes("accept") || v.includes("hire")) return "Accepted";
  if (v.includes("schedule") || v.includes("interview")) return "Scheduled";
  if (v.includes("pending")) return "Pending";
  if (v.includes("open")) return "Open";
  if (v.includes("close")) return "Closed";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

// Helpers copied from ManageappliedJobInfo.jsx to determine current freelancer id
const safeParseInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getCurrentFreelancerId = () => {
  const keys = ["freelancerId", "freelance_id", "freelancer_id", "userId", "user_id"];
  for (const k of keys) {
    const v = typeof window !== "undefined" ? localStorage.getItem(k) : null;
    const n = safeParseInt(v);
    if (n) return n;
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) {
    const payload = decodeJwt(token) || {};
    const idKeys = ["freelancer_id", "freelance_id", "user_id", "id"];
    for (const k of idKeys) {
      const n = safeParseInt(payload[k]);
      if (n) return n;
    }
  }
  return null;
};

const API_BASE_URL = "http://127.0.0.1:8000/api";

const ApplicantStatusBadge = ({ status }) => {
  const n = normalizeStatus(status);
  const cls =
    {
      Rejected: "badge bg-danger",
      Accepted: "badge bg-success",
      Scheduled: "badge bg-info text-white",
      Open: "badge bg-primary",
      Closed: "badge bg-dark",
      Pending: "badge bg-warning text-dark",
    }[n] || "badge bg-secondary";

  return <span className={cls}>{n || capitalizeFirst(status)}</span>;
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
        <ApplicantStatusBadge status={job.displayStatus || job.status} />
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
        let token = getAuthToken();
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        }

        if (!token) {
          setFetchError("No auth token found");
          setLoading(false);
          return;
        }

        // NOTE: Using the correct production-like URL from the second file for consistency and stability.
        // If the local URL is mandatory, change it back, but the structure is the key fix.
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
        
        // 🚀 FIX APPLIED HERE: Correctly extract the user.id from the first object
        // assuming the API returns an array of profiles or just an object with a 'user' property.
        // Based on FreelancerDashboard.js, the profile data seems to be an object *containing* the user object.
        // Let's adapt the logic from the first file's array assumption to extract the *user ID* like the second file does.
        
        // Assuming API response is an array [ { ..., user: { id: 123, ... } } ]
        let userId = null;
        if (Array.isArray(data) && data.length > 0) {
            userId = data[0].user?.id; // Access user.id if it exists
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

        setFreelancerUserId(userId); // Set the User ID
        setLoading(false);

      } catch (err) {
        console.error("Error fetching freelancer profile:", err);
        setFetchError(String(err));
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, []);

  // When we have a freelancerUserId, fetch that freelancer's jobs
  useEffect(() => {
    const fetchFreelancerJobs = async () => {
      // 💡 USING freelancerUserId (which is the user.id)
      if (!freelancerUserId) return; 
      
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

        // 🚀 FIX APPLIED HERE: Use the correct ID (freelancerUserId) and URL format (from FreelancerDashboard.js)
        const res = await fetch(`http://127.0.0.1:8000/api/freelance/${freelancerUserId}/`, {
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
              // Capitalize first letter for display in the Category column
              category: capitalizeFirst(j.job_category),
              date: j.date_posted,
              // store original normalized job status
              status: normalizeStatus(j.job_status),
              // displayStatus will be computed (may be overridden by application/interview status)
              displayStatus: normalizeStatus(j.job_status),
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
  }, [freelancerUserId]); // 💡 DEPENDENCY: Use the new state variable


  // Enrich each job with application/interview state for the current freelancer
  useEffect(() => {
    const enrichJobs = async () => {
      if (!freelancerUserId || !jobs.length) return;
      let token = getAuthToken();
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      }
      if (!token) return;

      const updated = await Promise.all(
        jobs.map(async (job) => {
          try {
            // Fetch applications for this job
            const res = await fetch(`${API_BASE_URL}/job-application/job/${job.id}`, {
              method: "GET",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return job; // leave as-is

            const data = await res.json();
            const apps = Array.isArray(data) ? data : Array.isArray(data?.applications) ? data.applications : [];

            // find application for current freelancer
            const myId = getCurrentFreelancerId() || freelancerUserId;
            const mine = apps.find((a) => {
              const ids = [a.freelancer_id, a.freelance_id, a.freelancer_user_id, a.user_id, a.userId];
              return ids.some((id) => safeParseInt(id) === myId);
            });

            // default display is job.status
            let display = job.status;

            if (mine) {
              const appStatus = normalizeStatus(mine.status || mine.application_status || mine.status);
              // If application explicitly Rejected or Accepted, show that
              if (appStatus === "Rejected" || appStatus === "Accepted") {
                display = appStatus;
              } else {
                // try to fetch interview for this application id to see if scheduled
                const appId = safeParseInt(mine.application_id || mine.applicationId || mine.id);
                if (appId) {
                  try {
                    const ires = await fetch(`${API_BASE_URL}/job-interview/application/${appId}`, {
                      method: "GET",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    });
                    if (ires.ok) {
                      const idata = await ires.json();
                      const interviews = Array.isArray(idata) ? idata : idata?.application_id ? [idata] : [];
                      if (interviews.length) {
                        // find any interview that appears scheduled
                        const latest = interviews[0];
                        const istatus = normalizeStatus(latest.status || latest.interview_status || "Scheduled");
                        if (istatus === "Scheduled") {
                          display = "Scheduled";
                        }
                      }
                    }
                  } catch (e) {
                    // ignore interview fetch failure and fall back
                  }
                }

                // If still not changed and job is Open and application is Pending -> show Pending
                if (display === job.status && job.status === "Open") {
                  const maybeAppStatus = normalizeStatus(mine.status || mine.application_status || mine.status);
                  if (maybeAppStatus === "Pending") display = "Pending";
                }
              }
            } else {
              // no application found for this user; keep job status
              display = job.status;
            }

            return { ...job, displayStatus: display };
          } catch (e) {
            return job;
          }
        })
      );

      setJobs(updated);
    };

    enrichJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.length, freelancerUserId]);

  

  const filteredJobs =
    filter === "All"
      ? jobs
      : jobs.filter((job) => (job.displayStatus || job.status) === filter);

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
              <Link href="/job-1" className="ud-btn btn-dark default-box-shadow2">
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
                  <option value="Accepted">Accepted</option>
                  <option value="Scheduled">Scheduled</option>
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