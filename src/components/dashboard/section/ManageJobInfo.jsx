"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

const tab = [
  "Posted Jobs",
  "Applications",
  "In Progress",
  "Closed Jobs",
];

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

// Row components with icon buttons

function PostedJobsRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.category}</td>
      <td>{job.date}</td>
      <td>
        <IconButton title="Edit Job" iconClass="fal fa-edit" colorClass="text-primary" onClick={() => alert(`Edit ${job.title}`)} />
        <IconButton title="Delete Job" iconClass="fal fa-trash-alt" colorClass="text-danger" onClick={() => alert(`Delete ${job.title}`)} />
      </td>
    </tr>
  );
}

function ApplicationsRow({ app }) {
  return (
    <tr>
      <td>{app.jobTitle}</td>
      <td>{app.appliedCount}</td>
      <td>
        <IconButton
          title="View Application List"
          iconClass="fal fa-users"
          colorClass="text-info"
          onClick={() => alert(`View applications for ${app.jobTitle}`)}
        />
      </td>
    </tr>
  );
}

function InProgressRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.progress}</td>
      <td>{job.interviewCalled}</td>
      <td>
        <IconButton
          title="Manage Hiring"
          iconClass="fal fa-tasks"
          colorClass="text-secondary"
          onClick={() => alert(`Manage hiring for ${job.title}`)}
        />
      </td>
    </tr>
  );
}

function ClosedJobsRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.status}</td>
      <td>
        <IconButton
          title="View Job Details"
          iconClass="fal fa-eye"
          colorClass="text-muted"
          onClick={() => alert(`View details for ${job.title}`)}
        />
      </td>
    </tr>
  );
}

// More dummy data added

function PostedJobs() {
  const jobs = [
    { title: "Frontend Developer", category: "Web Development", date: "2025-09-10" },
    { title: "UI/UX Designer", category: "Design", date: "2025-09-08" },
    { title: "Backend Developer", category: "Web Development", date: "2025-09-01" },
    { title: "Marketing Specialist", category: "Marketing", date: "2025-08-28" },
    { title: "Data Scientist", category: "Data Analysis", date: "2025-08-20" },
    { title: "Product Manager", category: "Management", date: "2025-08-15" },
    { title: "QA Engineer", category: "Quality Assurance", date: "2025-08-12" },
  ];

  return (
    <div className="packages_table table-responsive">
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Job Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {jobs.map((job, i) => (
            <PostedJobsRow key={i} job={job} />
          ))}
        </tbody>
      </table>
      <div className="mt30">
        <Pagination1 />
      </div>
    </div>
  );
}

function Applications() {
  const applications = [
    { jobTitle: "Frontend Developer", appliedCount: 25 },
    { jobTitle: "Backend Developer", appliedCount: 18 },
    { jobTitle: "UI/UX Designer", appliedCount: 15 },
    { jobTitle: "Data Scientist", appliedCount: 7 },
    { jobTitle: "Product Manager", appliedCount: 12 },
    { jobTitle: "QA Engineer", appliedCount: 5 },
    { jobTitle: "Marketing Specialist", appliedCount: 9 },
  ];

  return (
    <div className="packages_table table-responsive">
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Job Title</th>
            <th>Applied Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {applications.map((app, i) => (
            <ApplicationsRow key={i} app={app} />
          ))}
        </tbody>
      </table>
      <div className="mt30">
        <Pagination1 />
      </div>
    </div>
  );
}

function InProgress() {
  const jobsInProgress = [
    { title: "Mobile App Developer", progress: "Hiring", interviewCalled: 5 },
    { title: "QA Engineer", progress: "Interviewing", interviewCalled: 3 },
    { title: "Sales Executive", progress: "Interview Scheduled", interviewCalled: 2 },
    { title: "DevOps Engineer", progress: "Hiring", interviewCalled: 6 },
    { title: "Content Writer", progress: "Interviewing", interviewCalled: 4 },
    { title: "Graphic Designer", progress: "Hiring", interviewCalled: 3 },
    { title: "Support Specialist", progress: "Interview Scheduled", interviewCalled: 1 },
  ];

  return (
    <div className="packages_table table-responsive">
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Job Title</th>
            <th>Progress</th>
            <th>Interview Called</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {jobsInProgress.map((job, i) => (
            <InProgressRow key={i} job={job} />
          ))}
        </tbody>
      </table>
      <div className="mt30">
        <Pagination1 />
      </div>
    </div>
  );
}

function ClosedJobs() {
  const closedJobs = [
    { title: "Project Manager", status: "Hired" },
    { title: "Content Writer", status: "Manually Closed" },
    { title: "HR Specialist", status: "Hired" },
    { title: "Business Analyst", status: "Manually Closed" },
    { title: "Marketing Manager", status: "Hired" },
    { title: "Frontend Developer", status: "Manually Closed" },
    { title: "Backend Developer", status: "Hired" },
  ];

  return (
    <div className="packages_table table-responsive">
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Job Title</th>
            <th>Job Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {closedJobs.map((job, i) => (
            <ClosedJobsRow key={i} job={job} />
          ))}
        </tbody>
      </table>
      <div className="mt30">
        <Pagination1 />
      </div>
    </div>
  );
}

export default function ManageJobInfo() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Manage Job Listings</h2>
              <p className="text">View and manage all job postings, applications, and hiring stages.</p>
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
              <div className="navtab-style1">
                <nav>
                  <div className="nav nav-tabs mb30">
                    {tab.map((item, i) => (
                      <button
                        key={i}
                        className={`nav-link fw500 ps-0 ${selectedTab === i ? "active" : ""}`}
                        onClick={() => setSelectedTab(i)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </nav>

                {selectedTab === 0 && <PostedJobs />}
                {selectedTab === 1 && <Applications />}
                {selectedTab === 2 && <InProgress />}
                {selectedTab === 3 && <ClosedJobs />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}
