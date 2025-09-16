"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    department: "Engineering",
    jobType: "Full-time",
    workLocation: "Dubai Office",
    workMode: "On-site",
    roleOverview: "Responsible for building responsive web interfaces.",
    keyResponsibilities: [
      "Develop UI components with React and Next.js",
      "Collaborate with backend team",
      "Maintain code quality"
    ],
    requiredQualifications: [
      "3+ years experience in frontend development",
      "Proficiency in React",
      "Knowledge of CSS and JavaScript"
    ],
    preferredQualifications: [
      "Experience with Next.js",
      "Familiarity with UI/UX principles"
    ],
    languagesRequired: ["English"],
    category: "Web Development",
    salaryFrom: 15000,
    salaryTo: 22000,
    currency: "AED",
    applicationDeadline: "2025-09-15",
    applicationMethod: "Portal",
    interviewMode: "In-person",
    hiringManager: "Sarah Connor",
    numberOfOpenings: 2,
    expectedStartDate: "2025-10-01",
    screeningQuestions: [
      "Do you have experience with React hooks?",
      "Are you willing to relocate?"
    ],
    benefits: {
      healthInsurance: true,
      remoteWork: false,
      paidLeave: true,
      bonus: true,
    },
    date: "2025-09-10",
    status: "Open",
    description: "Build and maintain UI components with React and Next.js.",
    selectedCandidate: "John Doe",
    applicants: [
      { id: 1, name: "Alice Smith" },
      { id: 2, name: "Bob Johnson" },
    ],
  },
  {
    id: 2,
    title: "UI/UX Designer",
    department: "Design",
    jobType: "Full-time",
    workLocation: "Remote",
    workMode: "Remote",
    roleOverview: "Design intuitive and engaging user experiences.",
    keyResponsibilities: [
      "Create wireframes and prototypes",
      "Conduct user research",
      "Collaborate with developers"
    ],
    requiredQualifications: [
      "2+ years experience in UI/UX",
      "Strong portfolio",
      "Knowledge of design tools"
    ],
    preferredQualifications: [
      "Experience with Figma",
      "Understanding of accessibility standards"
    ],
    languagesRequired: ["English", "Arabic"],
    category: "Design",
    salaryFrom: 12000,
    salaryTo: 18000,
    currency: "AED",
    applicationDeadline: "2025-09-12",
    applicationMethod: "Portal",
    interviewMode: "Online",
    hiringManager: "Michael Scott",
    numberOfOpenings: 1,
    expectedStartDate: "2025-10-15",
    screeningQuestions: [
      "Are you familiar with Figma?",
      "Can you share your design portfolio?"
    ],
    benefits: {
      healthInsurance: true,
      remoteWork: true,
      paidLeave: true,
      bonus: false,
    },
    date: "2025-09-08",
    status: "Closed",
    description: "Design user interfaces and ensure great user experience.",
    selectedCandidate: "Jane Williams",
    applicants: [
      { id: 3, name: "Mark Benson" },
      { id: 4, name: "Lisa Ray" },
    ],
  },
];

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id, 10);
  const job = jobs.find((j) => j.id === jobId);

  const [activeTab, setActiveTab] = useState("overview");
  const [showApplicants, setShowApplicants] = useState(true);
  const [showSelected, setShowSelected] = useState(true);

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
            {job.keyResponsibilities.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case "qualifications":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Required Qualifications:</strong></p>
            <ul>
              {job.requiredQualifications.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p><strong>Preferred Qualifications:</strong></p>
            <ul>
              {job.preferredQualifications.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p><strong>Languages Required:</strong> {job.languagesRequired.join(", ")}</p>
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
              {job.screeningQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
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
