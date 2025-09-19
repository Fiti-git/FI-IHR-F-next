"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// Dummy job data
const jobs = [
  { id: 1, title: "Frontend Developer", category: "Web Development", date: "2025-09-10", status: "Open" },
  { id: 2, title: "UI/UX Designer", category: "Design", date: "2025-09-08", status: "Closed" },
  { id: 3, title: "Backend Developer", category: "Web Development", date: "2025-09-01", status: "Open" },
  { id: 4, title: "Marketing Specialist", category: "Marketing", date: "2025-08-28", status: "Closed" },
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

// Status badge component
const StatusBadge = ({ status }) => {
  const colorClass = status === "Open" ? "badge bg-success" : "badge bg-danger";
  return <span className={colorClass}>{status}</span>;
};

// Row component for Posted Jobs
function PostedJobsRow({ job }) {
  return (
    <tr>
      <td>{job.title}</td>
      <td>{job.category}</td>
      <td>{job.date}</td>
      <td>
        <StatusBadge status={job.status} />
      </td>
      <td>
        <Link href={`/jobs/${job.id}`} className="btn btn-sm btn-outline-primary me-2">
          View
        </Link>
        
      </td>
    </tr>
  );
}

export default function PostedJobs() {
  const [filter, setFilter] = useState("All");

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
              <h2>Posted Jobs</h2>
              <p className="text">Manage all your posted job listings.</p>
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
              {/* Filter */}
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Job Listings</h4>
                <select
                  className="form-select w-auto"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All</option>
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
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <PostedJobsRow key={job.id} job={job} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No jobs found.
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
