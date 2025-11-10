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
  const [applicationStatus, setApplicationStatus] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [isJobOpen, setIsJobOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // ← Moved UP
  const [interviewOpen, setInterviewOpen] = useState(true);


  const API_BASE_URL = "http://206.189.134.117:8000/api";

  // -----------------------------------------------------------------
  // Helpers (same as before)
  // -----------------------------------------------------------------
  const safeParseInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  // Ensure value is an array for safe mapping/joining.
  const safeArray = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      const s = v.trim();
      // try JSON array
      if (s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // fallthrough
        }
      }
      // comma-separated
      return s.split(',').map((x) => x.trim()).filter(Boolean);
    }
    if (typeof v === 'object') {
      try {
        return Object.values(v).filter((x) => x !== undefined && x !== null);
      } catch (e) {
        return [v];
      }
    }
    return [v];
  };

  const formatNumber = (n) => {
    if (n === undefined || n === null || n === '') return 'N/A';
    const num = Number(n);
    return Number.isFinite(num) ? num.toLocaleString() : String(n);
  };

  const normalizeStatus = (s) => {
    if (!s) return "";
    const v = String(s).trim().toLowerCase();
    if (v.includes("reject")) return "Rejected";
    if (v.includes("accept")) return "Accepted";
    if (v.includes("schedule")) return "Scheduled";
    if (v.includes("pending")) return "Pending";
    if (v.includes("open")) return "Open";
    if (v.includes("close")) return "Closed";
    return v.charAt(0).toUpperCase() + v.slice(1);
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
      const v = localStorage.getItem(k);
      const n = safeParseInt(v);
      if (n) return n;
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
  };

  // -----------------------------------------------------------------
  // Fetch Job + Transform
  // -----------------------------------------------------------------
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

        // Use 'date_time' from the API response
        const d = new Date(latest.date_time);

        // Use "Scheduled" as a default status if the 'status' field is missing in the interview object
        // const rawInterviewStatus = latest.status || "Scheduled";
        const rawInterviewStatus = "Scheduled";
        const status = normalizeStatus(rawInterviewStatus);

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

        // Update the main application status based on the latest interview status (normalized)
        setApplicationStatus(status);
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

  // -----------------------------------------------------------------
  // Fetch Application Status
  // -----------------------------------------------------------------
  useEffect(() => {
    async function fetchAppStatus() {
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

        const myId = getCurrentFreelancerId();
        if (!myId) return;

        const mine = apps.find((a) => {
          const ids = [a.freelancer_id, a.freelance_id, a.freelancer_user_id];
          return ids.some((id) => safeParseInt(id) === myId);
        });

        if (mine) setApplicationStatus(normalizeStatus(mine.status));
        // Store the application id so we can fetch interview by application
        if (mine) {
          const appId = safeParseInt(mine.application_id || mine.applicationId || mine.id);
          if (appId) setApplicationId(appId);
        }

        // Normalize status (e.g., "Pending" -> "Pending", "Rejected" -> "Rejected", etc.)
        const rawAppStatus = (mine?.status || "").trim();
        const normalized = normalizeStatus(rawAppStatus);

        // If the API uses 'Pending' or similar, leave it as Pending; Accepted/Rejected will be normalized
        setApplicationStatus(normalized);
      } catch (err) {
        console.error("Error fetching applications:", err);
        if (err.response?.status !== 404) {
          console.warn(`Failed to fetch applications.`);
        }
        setApplicationStatus("");
      }
    }
    if (jobId) fetchAppStatus();
  }, [jobId]);

  // -----------------------------------------------------------------
  // Fetch Interview Details
  // -----------------------------------------------------------------
  // Fetch interview details by application id (new endpoint)
  useEffect(() => {
    async function fetchInterview() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/job-interview/application/${applicationId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        // Support either single object or array responses
        const interviews = Array.isArray(data) ? data : data?.application_id ? [data] : [];
        if (!interviews.length) return;

        // Prefer entries with interview_date or date_time, sort newest first
        const latest = interviews
          .filter((i) => i?.interview_date || i?.date_time)
          .sort((a, b) => new Date(b.interview_date || b.date_time) - new Date(a.interview_date || a.date_time))[0] || interviews[0];

        if (!latest) return;

        const rawDate = latest.interview_date || latest.date_time || latest.interview_date_time;
        const d = new Date(rawDate);
        const date = isNaN(d) ? rawDate : d.toLocaleDateString();
        const time = isNaN(d) ? "N/A" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        setInterviewDetails({
          date,
          time,
          link: latest.interview_link || "",
          mode: latest.interview_mode || latest.interviewMode || "",
          status: normalizeStatus(latest.status || "Scheduled"),
          notes: latest.interview_notes || latest.interviewNotes || "",
        });
      } catch (e) {
        console.error(e);
      }
    }
    if (applicationId) fetchInterview();
  }, [applicationId]);

  // -----------------------------------------------------------------
  // EARLY RETURNS (AFTER ALL HOOKS)
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Loading job details...</h2>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Job not found</h2>
        <p className="text-danger">{error}</p>
        <Link href="/manage-myjobs" className="btn btn-primary mt-3">
          Back to Applied Jobs
        </Link>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Tab Content Renderer
  // -----------------------------------------------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="text-muted mt-3">
            {/* <p><strong>Description:</strong> {job.description}</p> */}
            <p><strong>Role Overview:</strong> {job.role_overview}</p>
            <p><strong>Department / Team:</strong> {job.department}</p>
            <p><strong>Job Type:</strong> {job.job_type}</p>
            <p><strong>Work Location:</strong> {job.work_location}</p>
            <p><strong>Work Mode:</strong> {job.work_mode}</p>
            <p><strong>Date Posted:</strong> {job.date_posted}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  job.job_status?.toLowerCase() === "open"
                    ? "bg-success"
                    : job.job_status?.toLowerCase() === "closed"
                    ? "bg-danger"
                    : "bg-secondary"
                }`}
              >
                {job.job_status ? job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1).toLowerCase() : "Unknown"}
              </span>
            </p>
          </div>
        );

      case "responsibilities":
        return (
          <ul className="mt-3 text-muted">
            {safeArray(job.key_responsibilities).length ? (
              safeArray(job.key_responsibilities).map((item, i) => <li key={i}>{item}</li>)
            ) : (
              <li>No responsibilities listed</li>
            )}
          </ul>
        );

      case "qualifications":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Required Qualifications:</strong></p>
            <ul>
              {safeArray(job.required_qualifications).length ? (
                safeArray(job.required_qualifications).map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>No required qualifications listed</li>
              )}
            </ul>

            <p><strong>Preferred Qualifications:</strong></p>
            <ul>
              {safeArray(job.preferred_qualifications).length ? (
                safeArray(job.preferred_qualifications).map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>No preferred qualifications listed</li>
              )}
            </ul>

            <p>
              <strong>Languages Required:</strong>{" "}
              {safeArray(job.language_required).length ? safeArray(job.language_required).join(", ") : "None specified"}
            </p>
          </div>
        );

      case "application":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Application Deadline:</strong> {job.application_deadline || "N/A"}</p>
            {/* <p><strong>Application Method:</strong> {job.applicationMethod || "N/A"}</p> */}
            <p><strong>Interview Mode:</strong> {job.interview_mode || "N/A"}</p>
            <p><strong>Hiring Manager:</strong> {job.hiring_manager || "N/A"}</p>
            <p><strong>Number of Openings:</strong> {job.number_of_openings || "N/A"}</p>
            <p><strong>Expected Start Date:</strong> {job.expected_start_date || "N/A"}</p>
            <p><strong>Screening Questions:</strong></p>
            <ul>
              {safeArray(job.screening_questions).length ? (
                safeArray(job.screening_questions).map((q, i) => <li key={i}>{q}</li>)
              ) : (
                <li>No screening questions listed</li>
              )}
            </ul>
          </div>
        );

      case "salaryBenefits":
        return (
          <div className="mt-3 text-muted">
            <p>
              <strong>Salary Range:</strong>{" "}
              {formatNumber(job.salary_from)} - {formatNumber(job.salary_to)} {job.currency || ''}
            </p>
            <p><strong>Benefits:</strong></p>
            <ul>
              <li>Health Insurance: {job.health_insurance ? "Yes" : "No"}</li>
              <li>Remote Work: {job.remote_work ? "Yes" : "No"}</li>
              <li>Paid Leave: {job.paid_leave ? "Yes" : "No"}</li>
              <li>Bonus: {job.bonus ? "Yes" : "No"}</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  // -----------------------------------------------------------------
  // Compute Display Status
  // -----------------------------------------------------------------
  const displayStatus = (() => {
    if (applicationStatus === "Rejected") return "Rejected";
    if (applicationStatus === "Accepted") return "Accepted";
    if (interviewDetails?.status === "Scheduled") return "Scheduled";
    return isJobOpen ? "Open" : "Closed";
  })();

  const badgeCls =
    {
      Rejected: "badge bg-danger",
      Accepted: "badge bg-success",
      Scheduled: "badge bg-info text-white",
      Open: "badge bg-primary",
      Closed: "badge bg-dark",
    }[displayStatus] || "badge bg-secondary";

  // -----------------------------------------------------------------
  // Final JSX
  // -----------------------------------------------------------------
  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      {/* Header */}
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{job.title}</h2>
              <p className="text">Your application and job details</p>
            </div>
            <div>
              <Link href="/manage-myjobs" className="ud-btn btn-dark default-box-shadow2">
                Back to Applied Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="mb-4">
        <strong>Application Status: </strong>
        <span className={badgeCls}>{displayStatus}</span>
      </div>

      {/* Tabs */}
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <h5 className="fw500 mb-3">Job Details</h5>
            <ul className="nav nav-tabs">
              {["overview", "responsibilities", "qualifications", "application", "salaryBenefits"].map((t) => (
                <li className="nav-item" key={t}>
                  <button
                    className={`nav-link ${activeTab === t ? "active" : ""}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t.charAt(0).toUpperCase() +
                      t
                        .slice(1)
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </button>
                </li>
              ))}
            </ul>
            <div className="tab-content p-3 border-top">{renderTabContent()}</div>
          </div>
        </div>
      </div>

      {/* Interview Details - styled like Applicant List table (collapsible) */}
      {interviewDetails && (
        <div className="row mt-4">
          <div className="col-xl-12">
            <div className="mb-4 border rounded p-3">
              <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setInterviewOpen(!interviewOpen)}
              >
                <h5 className="fw500 mb-0">Interview Details (Latest)</h5>
                <span>{interviewOpen ? "−" : "+"}</span>
              </div>

              {interviewOpen && (
                <div className="mt-3 table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <div className="bgc-white p-3 bdrs4">
                    <div className="text-muted">
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={badgeCls}>{interviewDetails.status}</span>
                      </p>
                      <p><strong>Date:</strong> {interviewDetails.date}</p>
                      <p><strong>Time:</strong> {interviewDetails.time}</p>
                      {interviewDetails.link && (
                        <p>
                          <strong>Link:</strong>{' '}
                          <a href={interviewDetails.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                            Join Interview
                          </a>
                        </p>
                      )}
                      {interviewDetails.mode && <p><strong>Mode:</strong> {interviewDetails.mode.toUpperCase()}</p>}
                      {interviewDetails.notes && (
                        <p style={{ whiteSpace: 'pre-line' }}>
                          <strong>Notes:</strong> {interviewDetails.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}