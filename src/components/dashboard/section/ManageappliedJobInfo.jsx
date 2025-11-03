"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppliedJobDetailPage() {
  const params = useParams();
  // Ensure jobId is an integer
  const jobId = parseInt(params.id, 10); 
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplicationStatus, setUserApplicationStatus] = useState("");
  const [interviewDetails, setInterviewDetails] = useState(null);
  
  // Base URL for API calls
  const API_BASE_URL = "http://206.189.134.117:8000/api";

  // --- Fetch Job Details ---
  useEffect(() => {
    async function fetchJob() {
      try {
        // Get token from localStorage (or cookie)
        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Access token not found. Please log in again.");
        }

        const res = await fetch(`${API_BASE_URL}/job-posting/${jobId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token here
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch job data (Status: ${res.status})`);
        }

        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err.message);
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
        const token = localStorage.getItem("accessToken");
        if (!token) {
          return;
        }

        const res = await fetch(`${API_BASE_URL}/job-interview/${jobId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.warn(`Failed to fetch interviews (Status: ${res.status}). Continuing.`);
          setUserApplicationStatus(""); 
          setInterviewDetails(null);
          return;
        }

        const data = await res.json();
        
        // 🚀 FIX: Handle both single object and array responses
        let interviews = [];
        if (Array.isArray(data)) {
            // Case 1: API returns an array of interviews
            interviews = data;
        } else if (data && typeof data === 'object' && data.interview_id) {
            // Case 2: API returns a single interview object (based on your example)
            interviews = [data]; 
        }

        if (interviews.length === 0) {
            // If no interview data, assume default status or leave blank
            return;
        }

        // Filter and sort by 'date_time' (which is present in your API example)
        const latest = interviews
          .filter(iv => iv && iv.date_time)
          .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))[0] || interviews[0];

        if (!latest) return;

        // Use 'date_time' from the API response
        const d = new Date(latest.date_time); 
        
        // Use "Scheduled" as a default status if the 'status' field is missing in the interview object
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
          // Fallback for invalid date
          setInterviewDetails({
            date: latest.date_time,
            time: "Time N/A",
            link: latest.interview_link || "",
            mode: latest.interview_mode || "",
            status: status,
            notes: latest.interview_notes || "",
          });
        }

        // Update the main application status based on the latest interview status
        setUserApplicationStatus(status);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      }
    }

    // Only run if a valid jobId is present
    if (jobId && !isNaN(jobId)) {
        fetchInterviews();
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
    // Default to 'Pending' if the status is empty string or unrecognized
  };

  const currentStatus = userApplicationStatus || "Pending";
  const badgeClass = statusBadgeClass[currentStatus] || "badge bg-secondary";

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
          {currentStatus}
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