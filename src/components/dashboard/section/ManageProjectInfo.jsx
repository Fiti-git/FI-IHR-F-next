"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// Status badge component for consistency
const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "badge bg-success";
      case "in_progress":
        return "badge bg-primary";
      case "completed":
        return "badge bg-info";
      case "cancelled":
      case "closed":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
        return "In Progress";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1);
    }
  };

  return <span className={getStatusClass(status)}>{getStatusLabel(status)}</span>;
};

// Row for a project
function ProjectRow({ project, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <tr>
      <td>
        <div>
          <h6 className="mb-1">{project.title}</h6>
          <small className="text-muted">{project.category}</small>
        </div>
      </td>
      <td>{formatDate(project.created_at)}</td>
      <td>
        <StatusBadge status={project.status} />
      </td>
      <td>
        <div className="fw500">
          ${parseFloat(project.budget).toLocaleString()}
        </div>
        <small className="text-muted">
          {project.project_type === 'fixed_price' ? 'Fixed Price' : 'Hourly'}
        </small>
      </td>
      <td>
        <div className="d-flex gap-2">
          <Link 
            href={`/projects/${project.id}`} 
            className="btn btn-sm btn-outline-primary"
            title="View Details"
          >
            <i className="fal fa-eye"></i>
          </Link>
          <Link 
            href={`/edit-project/${project.id}`} 
            className="btn btn-sm btn-outline-secondary"
            title="Edit Project"
          >
            <i className="fal fa-edit"></i>
          </Link>
          <button 
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(project.id)}
            title="Delete Project"
          >
            <i className="fal fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function ManageProjectInfo() {
  // State management
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project/projects/";

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    
    if (token) {
      fetchProjects();
    } else {
      setLoading(false);
      setError("Please log in to view your projects");
    }
  }, []);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch only the authenticated user's projects
      const response = await fetch(`${API_URL}my_projects/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched user projects:", data);
      
      // Handle both paginated and non-paginated responses
      const projectsArray = data.results ? data.results : data;
      setProjects(projectsArray);

    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to fetch projects");
      
      if (err.message.includes("Session expired")) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete project handler
  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}${projectId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to delete this project.");
        }
        throw new Error(`Failed to delete project`);
      }

      // Remove project from state
      setProjects(projects.filter(p => p.id !== projectId));
      alert("Project deleted successfully!");

    } catch (err) {
      console.error("Error deleting project:", err);
      alert(err.message || "Failed to delete project");
    }
  };

  // Filter projects by status
  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter((p) => p.status.toLowerCase() === filter.toLowerCase());

  // Render loading state
  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !isAuthenticated) {
    return (
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30">
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
                <br />
                <Link href="/login" className="btn btn-sm btn-primary mt-2">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>My Projects</h2>
              <p className="text">
                Manage all your posted projects. 
                <span className="fw-bold ms-2">
                  ({filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'})
                </span>
              </p>
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

              {/* Error message if any */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <strong>Error:</strong> {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError(null)}
                  ></button>
                </div>
              )}

              {/* Filter and Stats */}
              <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-0">Project Listings</h4>
                  <small className="text-muted">
                    Total: {projects.length} projects
                  </small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <label htmlFor="statusFilter" className="mb-0 me-2">Filter:</label>
                  <select
                    id="statusFilter"
                    className="form-select w-auto"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchProjects}
                    title="Refresh"
                  >
                    <i className="fal fa-sync"></i>
                  </button>
                </div>
              </div>

              {/* Projects Table */}
              <div className="table-responsive">
                <table className="table table-style3 at-savesearch">
                  <thead className="t-head">
                    <tr>
                      <th>Project Name</th>
                      <th>Posted Date</th>
                      <th>Status</th>
                      <th>Budget</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <ProjectRow 
                          key={project.id} 
                          project={project}
                          onDelete={handleDeleteProject}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="text-muted">
                            <i className="fal fa-folder-open fa-3x mb-3 d-block"></i>
                            <p className="mb-0">
                              {filter === "All" 
                                ? "No projects found. Start by creating your first project!" 
                                : `No ${filter.toLowerCase()} projects found.`}
                            </p>
                            {filter === "All" && (
                              <Link 
                                href="/create-projects" 
                                className="btn btn-primary mt-3"
                              >
                                Create Your First Project
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - only show if there are projects */}
              {filteredProjects.length > 0 && (
                <div className="mt-3">
                  <Pagination1 />
                </div>
              )}
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