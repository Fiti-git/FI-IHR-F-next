"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppliedJobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id, 10);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplicationStatus, setUserApplicationStatus] = useState("");
  const [interviewDetails, setInterviewDetails] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        // ✅ Get token from localStorage (or cookie)
        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Access token not found. Please log in again.");
        }

        const res = await fetch(`http://206.189.134.117:8000/api/job-posting/${jobId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Send token here
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

  // Fetch interview info for this job and populate status + details
  useEffect(() => {
    async function fetchInterviews() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          // If user isn't authenticated, skip interview fetch
          return;
        }

        const res = await fetch(`http://206.189.134.117:8000/api/interview/${jobId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Non-fatal; just no interview to show
          console.warn(`Failed to fetch interviews (Status: ${res.status})`);
          return;
        }

        const data = await res.json();
        const interviews = Array.isArray(data?.interviews) ? data.interviews : [];
        if (interviews.length === 0) return;

        // Pick the latest interview by date
        const latest = interviews
          .filter(iv => iv && iv.interview_date)
          .sort((a, b) => new Date(b.interview_date) - new Date(a.interview_date))[0] || interviews[0];

        if (!latest) return;

        const d = new Date(latest.interview_date);
        if (!isNaN(d)) {
          const date = d.toLocaleDateString();
          const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setInterviewDetails({
            date,
            time,
            link: latest.interview_link || "",
            mode: latest.interview_mode || "",
            status: latest.status || "",
            notes: latest.interview_notes || "",
          });
        } else {
          setInterviewDetails({
            date: latest.interview_date,
            time: "",
            link: latest.interview_link || "",
            mode: latest.interview_mode || "",
            status: latest.status || "",
            notes: latest.interview_notes || "",
          });
        }

        // Use backend status if available; default to "Interviewed" for backward-compat
        const backendStatus = (latest.status || "").trim();
        setUserApplicationStatus(backendStatus || "Interviewed");
      } catch (err) {
        console.error("Error fetching interviews:", err);
      }
    }

    fetchInterviews();
  }, [jobId]);

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

  // userApplicationStatus and interviewDetails are now populated from the interview API

  const statusBadgeClass = {
    Rejected: "badge bg-danger",
    Interviewed: "badge bg-warning text-dark",
    Hired: "badge bg-success",
    Scheduled: "badge bg-info text-white",
  };

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
              <Link href="/manage-myjobs" className="ud-btn btn-dark default-box-shadow2">
                Back to Applied Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <strong>Status: </strong>
        <span className={statusBadgeClass[userApplicationStatus] || "badge bg-secondary"}>
          {userApplicationStatus || "Pending"}
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
        <p><strong>Interview Mode:</strong> {job.interview_mode}</p>
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

      {/* Interview Details */}
      {interviewDetails && (
        <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
          <h5 className="fw500 mb-3">Interview Details</h5>
          <p><strong>Date:</strong> {interviewDetails.date}</p>
          <p><strong>Time:</strong> {interviewDetails.time}</p>
          {(interviewDetails.link && String(interviewDetails.mode).toLowerCase() === 'zoom') ? (
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
