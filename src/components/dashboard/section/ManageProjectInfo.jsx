"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// Dummy projects data
const projects = [
  { id: 1, name: "Website Redesign", postedDate: "2025-09-01", status: "Open" },
  { id: 2, name: "SEO Optimization", postedDate: "2025-08-25", status: "Open" },
  { id: 3, name: "Content Marketing Plan", postedDate: "2025-08-15", status: "Closed" },
  { id: 4, name: "Brand Identity Refresh", postedDate: "2025-07-30", status: "Open" },
  { id: 5, name: "Backend API Development", postedDate: "2025-07-15", status: "Open" },
];

// Status badge component for consistency
const StatusBadge = ({ status }) => {
  const colorClass = status === "Open" ? "badge bg-success" : "badge bg-danger";
  return <span className={colorClass}>{status}</span>;
};

// Row for a project
function ProjectRow({ project }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>{project.postedDate}</td>
      <td><StatusBadge status={project.status} /></td>
      <td>
        <Link href={`/projects/${project.id}`} className="btn btn-sm btn-outline-primary">
          View
        </Link>
      </td>
    </tr>
  );
}

export default function ManageProjects() {
  const [filter, setFilter] = useState("All");

  const filteredProjects =
    filter === "All" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Projects</h2>
              <p className="text">Manage all your posted projects.</p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link href="/create-projects" className="ud-btn btn-dark default-box-shadow2">
                Post Project <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">

              {/* Filter */}
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Project Listings</h4>
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

              {/* Projects Table */}
              <div className="table-responsive">
                <table className="table table-style3 at-savesearch">
                  <thead className="t-head">
                    <tr>
                      <th>Project Name</th>
                      <th>Posted Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <ProjectRow key={project.id} project={project} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-3">
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
