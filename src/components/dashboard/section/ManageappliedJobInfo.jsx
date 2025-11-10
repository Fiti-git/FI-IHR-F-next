"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function AppliedJobDetailPage() {
  const params = useParams();
  // Ensure jobId is an integer
  const jobId = parseInt(params.id, 10);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Status coming from interviews (e.g., Scheduled)
  const [userApplicationStatus, setUserApplicationStatus] = useState("");
  const [interviewDetails, setInterviewDetails] = useState(null);
  // Status coming from Job Provider decision (Accepted/Rejected/Pending)
  const [applicationStatus, setApplicationStatus] = useState("");
  // Whether the job is open or closed (derived)
  const [isJobOpen, setIsJobOpen] = useState(true);

  // --- Helpers ---
  function safeParseInt(value) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
  }

  function decodeJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  function getCurrentFreelancerId() {
    // Try common localStorage keys first
    const lsKeys = [
      "freelancerId",
      "freelance_id",
      "freelancer_id",
      "userId",
      "user_id",
    ];
    for (const k of lsKeys) {
      const v = localStorage.getItem(k);
      const parsed = safeParseInt(v);
      if (parsed) return parsed;
    }
    // Fallback: try to decode from JWT
    const token = localStorage.getItem("access_token");
    if (token) {
      const payload = decodeJwt(token) || {};
      const possibleKeys = ["freelancer_id", "freelance_id", "user_id", "id"];
      for (const k of possibleKeys) {
        const parsed = safeParseInt(payload?.[k]);
        if (parsed) return parsed;
      }
    }
    return null;
  }

  // --- Fetch Job Details ---
  useEffect(() => {
    async function fetchJob() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Access token not found. Please log in again.");
        }

        const res = await api.get(`/api/job-posting/${jobId}/`);
        setJob(res.data);

        // Derive Open/Closed from application_deadline when available
        try {
          if (res.data?.application_deadline) {
            const deadline = new Date(res.data.application_deadline);
            setIsJobOpen(!isNaN(deadline) ? Date.now() <= deadline.getTime() : true);
          } else {
            setIsJobOpen(true);
          }
        } catch {
          setIsJobOpen(true);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  // --- Fetch Interview Info (FIXED) ---
  useEffect(() => {
    async function fetchInterviews() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          return;
        }

        const res = await api.get(`/api/job-interview/${jobId}/`);
        const data = res.data;

        // Handle both single object and array responses
        let interviews = [];
        if (Array.isArray(data)) {
          interviews = data;
        } else if (data && typeof data === 'object' && data.interview_id) {
          interviews = [data];
        }

        if (interviews.length === 0) {
          return;
        }

        // Filter and sort by 'date_time'
        const latest = interviews
          .filter(iv => iv && iv.date_time)
          .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))[0] || interviews[0];

        if (!latest) return;

        const d = new Date(latest.date_time);
        const status = (latest.status || "Scheduled").trim();

        if (!isNaN(d)) {
          const date = d.toLocaleDateString();
          const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setInterviewDetails({
            date,
            time,
            link: latest.interview_link || "",
            mode: latest.interview_mode || "",
            status: status,
            notes: latest.interview_notes || "",
          });
        } else {
          setInterviewDetails({
            date: latest.date_time,
            time: "Time N/A",
            link: latest.interview_link || "",
            mode: latest.interview_mode || "",
            status: status,
            notes: latest.interview_notes || "",
          });
        }

        setUserApplicationStatus(status);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        if (err.response?.status !== 404) {
          console.warn(`Failed to fetch interviews. Continuing.`);
        }
        setUserApplicationStatus("");
        setInterviewDetails(null);
      }
    }

    if (jobId && !isNaN(jobId)) {
      fetchInterviews();
    }
  }, [jobId]);

  // --- Fetch Application Status (Accepted/Rejected/Pending) ---
  useEffect(() => {
    async function fetchApplications() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await api.get(`/api/job-application/job/${jobId}`);
        const data = res.data;

        const apps = Array.isArray(data) ? data : Array.isArray(data?.applications) ? data.applications : [];
        if (!apps.length) {
          setApplicationStatus("");
          return;
        }

        const myFreelancerId = getCurrentFreelancerId();
        if (!myFreelancerId) {
          console.warn("Could not determine current freelancer id. Skipping application status.");
          setApplicationStatus("");
          return;
        }

        const mine = apps.find(a => safeParseInt(a?.freelance_id) === myFreelancerId);
        const status = (mine?.status || "").trim();
        setApplicationStatus(status);
      } catch (err) {
        console.error("Error fetching applications:", err);
        if (err.response?.status !== 404) {
          console.warn(`Failed to fetch applications.`);
        }
        setApplicationStatus("");
      }
    }

    if (jobId && !isNaN(jobId)) {
      fetchApplications();
    }
  }, [jobId]);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h3>Loading job details...</h3>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Job not found</h2>
        <p className="text-danger">{error}</p>
        <Link href="/applied-jobs" className="btn btn-primary mt-3">
          Back to Applied Jobs
        </Link>
      </div>
    );
  }

  const statusBadgeClass = {
    Rejected: "badge bg-danger",
    Interview: "badge bg-warning text-dark",
    Hired: "badge bg-success",
    Scheduled: "badge bg-info text-white", // Added for new interview status
    Accepted: "badge bg-success",
    Open: "badge bg-primary",
    Closed: "badge bg-dark",
    // Default to 'Pending' if the status is empty string or unrecognized
  };

  // Compute the display status with precedence:
  // Rejected > Accepted > Scheduled > Open/Closed > Pending
  const displayStatus = (() => {
    const app = (applicationStatus || "").toLowerCase();
    if (app === "rejected") return "Rejected";
    if (app === "accepted") return "Accepted";
    const iv = (userApplicationStatus || interviewDetails?.status || "").toLowerCase();
    if (iv.includes("scheduled")) return "Scheduled";
    return isJobOpen ? "Open" : "Closed";
  })();

  const badgeClass = statusBadgeClass[displayStatus] || "badge bg-secondary";

  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{job.job_title}</h2>
              <p className="text">Full Job Description and Your Application Status</p>
            </div>
            <div>
              <Link href="/applied-jobs" className="ud-btn btn-dark default-box-shadow2">
                Back to Applied Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <strong>Status: </strong>
        <span className={badgeClass}>
          {displayStatus}
        </span>
      </div>

      {/* Job Overview */}
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Job Overview</h5>
        <p><strong>Description:</strong> {job.role_overview || "N/A"}</p>
        <p><strong>Department / Team:</strong> {job.department}</p>
        <p><strong>Job Type:</strong> {job.job_type}</p>
        <p><strong>Work Location:</strong> {job.work_location}</p>
        <p><strong>Work Mode:</strong> {job.work_mode}</p>
        <p><strong>Posted Date:</strong> {job.date_posted}</p>
        <p><strong>Category:</strong> {job.category}</p>
      </div>

      {/* Key Responsibilities */}
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Key Responsibilities</h5>
        <ul className="text-muted">
          {job.key_responsibilities?.split(",").map((item, i) => (
            <li key={i}>{item.trim()}</li>
          ))}
        </ul>
      </div>

      {/* Qualifications */}
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Qualifications</h5>
        <p><strong>Required:</strong> {job.required_qualifications}</p>
        <p><strong>Preferred:</strong> {job.preferred_qualifications}</p>
        <p><strong>Languages Required:</strong> {job.language_required}</p>
      </div>

      {/* Application Info */}
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Application Info</h5>
        <p><strong>Application Deadline:</strong> {job.application_deadline}</p>
        <p><strong>Interview Mode (Job Setting):</strong> {job.interview_mode}</p>
        <p><strong>Hiring Manager:</strong> {job.hiring_manager}</p>
        <p><strong>Number of Openings:</strong> {job.number_of_openings}</p>
        <p><strong>Expected Start Date:</strong> {job.expected_start_date}</p>
        <p><strong>Screening Questions:</strong> {job.screening_questions}</p>
      </div>

      {/* Salary & Benefits */}
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Salary & Benefits</h5>
        <p>
          <strong>Salary:</strong> {job.salary_from} – {job.salary_to} {job.currency}
        </p>
        <ul>
          <li>Health Insurance: {job.health_insurance ? "Yes" : "No"}</li>
          <li>Remote Work: {job.remote_work ? "Yes" : "No"}</li>
          <li>Paid Leave: {job.paid_leave ? "Yes" : "No"}</li>
          <li>Bonus: {job.bonus ? "Yes" : "No"}</li>
        </ul>
      </div>

      {/* Interview Details (Fixed to Show) */}
      {interviewDetails && (
        <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
          <h5 className="fw500 mb-3">Interview Details (Latest Update)</h5>
          <p><strong>Status:</strong> <span className={statusBadgeClass[interviewDetails.status] || "badge bg-secondary"}>{interviewDetails.status}</span></p>
          <p><strong>Date:</strong> {interviewDetails.date}</p>
          <p><strong>Time:</strong> {interviewDetails.time}</p>
          {/* Check if a link exists AND the mode suggests a link is appropriate (e.g., Zoom/Online) */}
          {(interviewDetails.link && String(interviewDetails.mode).toLowerCase().includes('zoom')) ? (
            <p>
              <strong>Link:</strong>{" "}
              <a
                href={interviewDetails.link}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Interview
              </a>
            </p>
          ) : null}
          {interviewDetails.mode ? (
            <p><strong>Mode:</strong> {String(interviewDetails.mode).toUpperCase()}</p>
          ) : null}
          {interviewDetails.notes ? (
            <p style={{ whiteSpace: 'pre-line' }}><strong>Notes:</strong>{" "}{interviewDetails.notes}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
// End of AppliedJobDetailPage component