"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

const projects = [
  { id: 1, name: "Website Redesign", proposalSentDate: "2025-09-01", status: "Rejected" },
  { id: 2, name: "Mobile App Development", proposalSentDate: "2025-08-25", status: "Accepted" },
  { id: 3, name: "E-Commerce Website", proposalSentDate: "2025-08-15", status: "Ongoing" },
  { id: 4, name: "Analytics Dashboard", proposalSentDate: "2025-07-30", status: "Closed" },
];



// Status badge component for consistency
const StatusBadge = ({ status }) => {
  const colorClass =
    status === "Accepted" ? "badge bg-success" :
    status === "Ongoing" ? "badge bg-primary" :
    status === "Rejected" ? "badge bg-danger" : "badge bg-secondary";
  
  return <span className={colorClass}>{status}</span>;
};

// Row for a project
function ProjectRow({ project }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>{project.proposalSentDate}</td>
      <td><StatusBadge status={project.status} /></td>
      <td>
        <Link href={`/project/${project.id}`} className="btn btn-sm btn-outline-primary">
          View
        </Link>
        {project.status === "Accepted" && (
          <Link href={`/project/${project.id}/create-milestone`} className="btn btn-sm btn-outline-success ms-2">
            Create Milestone
          </Link>
        )}
      </td>
    </tr>
  );
}

export default function FreelancerProjects() {
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
              <p className="text">Find and manage the projects you've applied to.</p>
            </div>
          </div>

          {/* Find a Project Button */}
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link href="/project-1" className="ud-btn btn-dark default-box-shadow2">
                Find a Project <i className="fal fa-arrow-right-long" />
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
                  <option value="Accepted">Accepted</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Projects Table */}
              <div className="table-responsive">
                <table className="table table-style3 at-savesearch">
                  <thead className="t-head">
                    <tr>
                      <th>Project Name</th>
                      <th>Proposal Sent Date</th>
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
