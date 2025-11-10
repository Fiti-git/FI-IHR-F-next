"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";
import api from '@/lib/axios';

// Status badge component for consistency
const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "badge bg-success";
      case "submitted":
        return "badge bg-warning text-dark";
      case "rejected":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const getStatusLabel = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  return <span className={getStatusClass(status)}>{getStatusLabel(status)}</span>;
};

// Row for a project
function ProjectRow({ proposal }) {
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
          <h6 className="mb-1">{proposal.project_title || 'N/A'}</h6>
          <small className="text-muted">Budget: ${parseFloat(proposal.budget).toFixed(2)}</small>
        </div>
      </td>
      <td>{formatDate(proposal.submitted_at)}</td>
      <td><StatusBadge status={proposal.status} /></td>
      <td>
        <div className="d-flex gap-2 flex-wrap">
          <Link
            href={`/project-single/${proposal.project}`}
            className="btn btn-sm btn-outline-primary"
            title="View Project"
          >
            <i className="fal fa-eye me-1"></i>
            View
          </Link>

          {/* Show Milestone button only for accepted proposals */}
          {proposal.status === "accepted" && (
            <Link
              href={`/project/${proposal.project}/create-milestone`}
              className="btn btn-sm btn-success"
              title="Create Milestone"
            >
              <i className="fal fa-tasks me-1"></i>
              Milestone
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function FreelancerProjects() {
  // State management
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    if (token) {
      fetchMyProposals();
    } else {
      setLoading(false);
      setError("Please log in to view your proposals");
    }
  }, []);

  // Fetch freelancer's proposals from API
  const fetchMyProposals = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await api.get('/api/project/proposals/my_proposals/');
      console.log("Fetched freelancer proposals:", response.data);

      // Handle both paginated and non-paginated responses
      const proposalsArray = response.data.results ? response.data.results : response.data;
      setProposals(proposalsArray);

    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch proposals");

      // Axios interceptor will handle 401 redirect automatically
    } finally {
      setLoading(false);
    }
  };

  // Filter proposals by status
  const filteredProposals = filter === "All"
    ? proposals
    : proposals.filter((p) => p.status.toLowerCase() === filter.toLowerCase());

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
              <p className="mt-3">Loading your proposals...</p>
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
              <h2>My Proposals</h2>
              <p className="text">
                Track your project proposals and manage accepted projects.
                <span className="fw-bold ms-2">
                  ({filteredProposals.length} {filteredProposals.length === 1 ? 'proposal' : 'proposals'})
                </span>
              </p>
            </div>
          </div>

          {/* Find a Project Button */}
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link href="/project-1" className="ud-btn btn-dark default-box-shadow2">
                Find Projects <i className="fal fa-arrow-right-long" />
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
                  <h4 className="mb-0">Proposal Listings</h4>
                  <small className="text-muted">
                    Total: {proposals.length} proposals
                    {proposals.filter(p => p.status === 'accepted').length > 0 && (
                      <span className="text-success ms-2">
                        • {proposals.filter(p => p.status === 'accepted').length} Accepted
                      </span>
                    )}
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
                    <option value="submitted">Submitted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchMyProposals}
                    title="Refresh"
                  >
                    <i className="fal fa-sync"></i>
                  </button>
                </div>
              </div>

              {/* Proposals Table */}
              <div className="table-responsive">
                <table className="table table-style3 at-savesearch">
                  <thead className="t-head">
                    <tr>
                      <th>Project Name</th>
                      <th>Submitted Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {filteredProposals.length > 0 ? (
                      filteredProposals.map((proposal) => (
                        <ProjectRow key={proposal.id} proposal={proposal} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <div className="text-muted">
                            <i className="fal fa-folder-open fa-3x mb-3 d-block"></i>
                            <p className="mb-0">
                              {filter === "All"
                                ? "No proposals found. Start applying to projects!"
                                : `No ${filter.toLowerCase()} proposals found.`}
                            </p>
                            {filter === "All" && (
                              <Link
                                href="/project-1"
                                className="btn btn-primary mt-3"
                              >
                                Browse Projects
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Info Box for Accepted Proposals */}
              {proposals.filter(p => p.status === 'accepted').length > 0 && (
                <div className="alert alert-info mt-3" role="alert">
                  <i className="fal fa-info-circle me-2"></i>
                  <strong>Tip:</strong> You have {proposals.filter(p => p.status === 'accepted').length} accepted proposal(s).
                  Click the <strong>Milestone</strong> button to create project milestones and track your progress.
                </div>
              )}

              {/* Pagination - only show if there are proposals */}
              {filteredProposals.length > 0 && (
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