"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const fetchJobDetails = async (jobId) => {
  try {
    let accessToken;
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem("accessToken");
    }
    
    if (!accessToken) {
      console.error('No access token found');
      return null;
    }

    const response = await fetch(`http://127.0.0.1:8000/api/job-posting/${jobId}/`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      return null;
    }

    const jobData = await response.json();
    console.log('API Response:', jobData);
    console.log('Key Responsibilities type:', typeof jobData.key_responsibilities);
    console.log('Key Responsibilities value:', jobData.key_responsibilities);
    return jobData;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id, 10);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showApplicants, setShowApplicants] = useState(true);
  const [showSelected, setShowSelected] = useState(true);

  useEffect(() => {
    const loadJobDetails = async () => {
      const jobData = await fetchJobDetails(jobId);
      if (jobData) {
        // Transform API data to match our component's expected structure
        const transformedJob = {
          id: jobData.job_id,
          title: jobData.job_title,
          department: jobData.department,
          jobType: jobData.job_type,
          workLocation: jobData.work_location,
          workMode: jobData.work_mode,
          roleOverview: jobData.role_overview,
          keyResponsibilities: Array.isArray(jobData.key_responsibilities) ? 
            jobData.key_responsibilities : 
            jobData.key_responsibilities ? [jobData.key_responsibilities] : [],
          requiredQualifications: Array.isArray(jobData.required_qualifications) ? 
            jobData.required_qualifications : 
            jobData.required_qualifications ? [jobData.required_qualifications] : [],
          preferredQualifications: Array.isArray(jobData.preferred_qualifications) ? 
            jobData.preferred_qualifications : 
            jobData.preferred_qualifications ? [jobData.preferred_qualifications] : [],
          languagesRequired: Array.isArray(jobData.language_required) ? 
            jobData.language_required : 
            jobData.language_required ? [jobData.language_required] : [], // Note: backend uses language_required
          category: jobData.category,
          salaryFrom: jobData.salary_from, 
          salaryTo: jobData.salary_to,
          currency: jobData.currency,
          applicationDeadline: jobData.application_deadline,
          interviewMode: jobData.interview_mode,
          hiringManager: jobData.hiring_manager,
          numberOfOpenings: jobData.number_of_openings,
          expectedStartDate: jobData.expected_start_date,
          screeningQuestions: Array.isArray(jobData.screening_questions) ? 
            jobData.screening_questions : 
            jobData.screening_questions ? [jobData.screening_questions] : [],
          benefits: {
            healthInsurance: jobData.health_insurance || false,
            remoteWork: jobData.remote_work || false,
            paidLeave: jobData.paid_leave || false,
            bonus: jobData.bonus || false,
          },
          date: jobData.date_posted,
          status: jobData.job_status || "Open",
          description: jobData.role_overview || "", // Using role_overview as description
          applicants: [], // Add empty array as default for applicants since it's not in the API
          selectedCandidate: null // Add null as default for selectedCandidate
        };
        setJob(transformedJob);
      }
      setLoading(false);
    };

    loadJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Loading job details...</h2>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Job not found</h2>
        <Link href="/manage-jobs" className="btn btn-primary mt-3">
          Back to Jobs
        </Link>
      </div>
    );
  }

  // Helper: render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="text-muted mt-3">
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Role Overview:</strong> {job.roleOverview}</p>
            <p><strong>Department / Team:</strong> {job.department}</p>
            <p><strong>Job Type:</strong> {job.jobType}</p>
            <p><strong>Work Location:</strong> {job.workLocation}</p>
            <p><strong>Work Mode:</strong> {job.workMode}</p>
            <p><strong>Date Posted:</strong> {job.date}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge ${job.status === "Open" ? "bg-success" : "bg-danger"}`}>
                {job.status}
              </span>
            </p>
          </div>
        );
      case "responsibilities":
        return (
          <ul className="mt-3 text-muted">
            {job.keyResponsibilities ? (
              typeof job.keyResponsibilities === 'string' ? 
                <li>{job.keyResponsibilities}</li> :
                Array.isArray(job.keyResponsibilities) ? 
                  job.keyResponsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) :
                  <li>No responsibilities listed</li>
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
              {job.requiredQualifications ? (
                typeof job.requiredQualifications === 'string' ? 
                  <li>{job.requiredQualifications}</li> :
                  Array.isArray(job.requiredQualifications) ? 
                    job.requiredQualifications.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) :
                    <li>No required qualifications listed</li>
              ) : (
                <li>No required qualifications listed</li>
              )}
            </ul>
            <p><strong>Preferred Qualifications:</strong></p>
            <ul>
              {job.preferredQualifications ? (
                typeof job.preferredQualifications === 'string' ? 
                  <li>{job.preferredQualifications}</li> :
                  Array.isArray(job.preferredQualifications) ? 
                    job.preferredQualifications.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) :
                    <li>No preferred qualifications listed</li>
              ) : (
                <li>No preferred qualifications listed</li>
              )}
            </ul>
            <p><strong>Languages Required:</strong>{' '}
              {job.languagesRequired ? 
                (Array.isArray(job.languagesRequired) ? 
                  job.languagesRequired.join(", ") : 
                  job.languagesRequired
                ) : 
                "None specified"}
            </p>
          </div>
        );
      case "application":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Application Deadline:</strong> {job.applicationDeadline}</p>
            <p><strong>Application Method:</strong> {job.applicationMethod}</p>
            <p><strong>Interview Mode:</strong> {job.interviewMode}</p>
            <p><strong>Hiring Manager:</strong> {job.hiringManager}</p>
            <p><strong>Number of Openings:</strong> {job.numberOfOpenings}</p>
            <p><strong>Expected Start Date:</strong> {job.expectedStartDate}</p>
            <p><strong>Screening Questions:</strong></p>
            <ul>
              {job.screeningQuestions ? (
                typeof job.screeningQuestions === 'string' ? 
                  <li>{job.screeningQuestions}</li> :
                  Array.isArray(job.screeningQuestions) ? 
                    job.screeningQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    )) :
                    <li>No screening questions listed</li>
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
              <strong>Salary Range:</strong> {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} {job.currency}
            </p>
            <p><strong>Benefits:</strong></p>
            <ul>
              <li>Health Insurance: {job.benefits.healthInsurance ? "Yes" : "No"}</li>
              <li>Remote Work: {job.benefits.remoteWork ? "Yes" : "No"}</li>
              <li>Paid Leave: {job.benefits.paidLeave ? "Yes" : "No"}</li>
              <li>Bonus: {job.benefits.bonus ? "Yes" : "No"}</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      <div className="row pb40">
        <div className="col-lg-12">
          {/* Title Area */}
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{job.title}</h2>
              <p className="text">Manage this job listing details and applicants.</p>
            </div>

            {/* Edit Job Button */}
            <div>
              <Link
                href={`/edit-job/${job.id}`}
                className="ud-btn btn-dark default-box-shadow2"
              >
                Edit Job <i className="fal fa-edit" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Job Details */}
{/* Tabs for Job Details */}
<div className="row">
  <div className="col-xl-12">
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <h5 className="fw500 mb-0 mb-3">Job Details</h5> {/* moved inside and added mb-3 */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "responsibilities" ? "active" : ""}`}
            onClick={() => setActiveTab("responsibilities")}
          >
            Responsibilities
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "qualifications" ? "active" : ""}`}
            onClick={() => setActiveTab("qualifications")}
          >
            Qualifications
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "application" ? "active" : ""}`}
            onClick={() => setActiveTab("application")}
          >
            Application Info
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "salaryBenefits" ? "active" : ""}`}
            onClick={() => setActiveTab("salaryBenefits")}
          >
            Salary & Benefits
          </button>
        </li>
      </ul>

      <div className="tab-content p-3 border-top">
        {renderTabContent()}
      </div>
    </div>
  </div>
</div>


      {/* Applicants List */}
      <div className="row mt-4">
        <div className="col-xl-12">
          <div className="mb-4 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => setShowApplicants(!showApplicants)}
            >
              <h5 className="fw500 mb-0">Applicant List</h5>
              <span>{showApplicants ? "−" : "+"}</span>
            </div>
            {showApplicants && (
              <div className="mt-3 table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="table-style3 table at-savesearch mb-0">
                  <thead className="t-head">
                    <tr>
                      <th>Applicant Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {job.applicants.length > 0 ? (
                      job.applicants.map((applicant) => (
                        <tr key={applicant.id}>
                          <td>{applicant.name}</td>
<td>
  <button
    className="btn btn-sm btn-outline-primary me-2"
    onClick={() => alert(`View Profile: ${applicant.name}`)}
  >
    View Profile
  </button>
  <button
    className="btn btn-sm btn-info me-2"
    onClick={() => alert(`Move to Interview: ${applicant.name}`)}
  >
    To Interview
  </button>
  <button
    className="btn btn-sm btn-outline-danger"
    onClick={() => alert(`Reject: ${applicant.name}`)}
  >
    Reject
  </button>
</td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center">
                          No applicants yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Candidate (if job closed) */}
      {job.status === "Closed" && (
        <div className="row">
          <div className="col-xl-12">
            <div className="mb-4 border rounded p-3">
              <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setShowSelected(!showSelected)}
              >
                <h5 className="fw500 mb-0">Selected Candidate</h5>
                <span>{showSelected ? "−" : "+"}</span>
              </div>
              {showSelected && (
                <div className="mt-3">
                  <p className="text-muted">
                    <strong>Candidate Selected:</strong> {job.selectedCandidate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
