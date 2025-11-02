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
    switch (status?.toLowerCase()) {
      case "submitted":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1);
    }
  };

  return <span className={getStatusClass(status)}>{getStatusLabel(status)}</span>;
};

// Row for a project
function ProjectRow({ proposal, onViewProposal }) {
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
          <h6 className="mb-1">{proposal.project_title}</h6>
          <small className="text-muted">Budget: ${parseFloat(proposal.budget).toLocaleString()}</small>
        </div>
      </td>
      <td>{formatDate(proposal.submitted_at)}</td>
      <td>
        <StatusBadge status={proposal.status} />
      </td>
      <td>
        <div className="d-flex gap-2">
          <Link 
            href={`/project-single/${proposal.project}`} 
            className="btn btn-sm btn-outline-primary"
            title="View Project"
          >
            <i className="fal fa-eye me-1"></i>
            View Project
          </Link>
          <button
            className="btn btn-sm btn-outline-info"
            onClick={() => onViewProposal(proposal)}
            title="View Proposal Details"
          >
            <i className="fal fa-file-alt me-1"></i>
            My Proposal
          </button>
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
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://206.189.134.117:8000/api/project";

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
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

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch proposals submitted by the authenticated user (freelancer)
      const response = await fetch(`${API_URL}/proposals/my_proposals/`, {
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
      console.log("Fetched my proposals:", data);
      
      // Handle both paginated and non-paginated responses
      const proposalsArray = data.results ? data.results : data;
      setProposals(proposalsArray);

    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError(err.message || "Failed to fetch proposals");
      
      if (err.message.includes("Session expired")) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle view proposal details
  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setShowProposalModal(true);
  };

  // Filter proposals by status
  const filteredProposals = filter === "All" 
    ? proposals 
    : proposals.filter((p) => p.status.toLowerCase() === filter.toLowerCase());

  // Get statistics
  const stats = {
    total: proposals.length,
    submitted: proposals.filter(p => p.status === 'submitted').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

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
                View and manage all projects you've applied to.
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

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="ps-widget bgc-white bdrs4 p20 mb30 text-center">
              <h3 className="text-thm">{stats.total}</h3>
              <p className="mb-0">Total Proposals</p>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="ps-widget bgc-white bdrs4 p20 mb30 text-center">
              <h3 className="text-warning">{stats.submitted}</h3>
              <p className="mb-0">Pending</p>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="ps-widget bgc-white bdrs4 p20 mb30 text-center">
              <h3 className="text-success">{stats.accepted}</h3>
              <p className="mb-0">Accepted</p>
            </div>
          </div>
          <div className="col-sm-6 col-xl-3">
            <div className="ps-widget bgc-white bdrs4 p20 mb30 text-center">
              <h3 className="text-danger">{stats.rejected}</h3>
              <p className="mb-0">Rejected</p>
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
                  <h4 className="mb-0">Proposal History</h4>
                  <small className="text-muted">
                    Total: {proposals.length} proposals
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
                    <option value="submitted">Pending</option>
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
                      <th>Proposal Sent Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {filteredProposals.length > 0 ? (
                      filteredProposals.map((proposal) => (
                        <ProjectRow 
                          key={proposal.id} 
                          proposal={proposal}
                          onViewProposal={handleViewProposal}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <div className="text-muted">
                            <i className="fal fa-inbox fa-3x mb-3 d-block"></i>
                            <p className="mb-0">
                              {filter === "All" 
                                ? "No proposals yet. Start by applying to projects!" 
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

      {/* Proposal Details Modal */}
      {showProposalModal && selectedProposal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowProposalModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Proposal Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowProposalModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="fw-bold">Project:</h6>
                  <p>{selectedProposal.project_title}</p>
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold">Your Budget:</h6>
                  <p className="text-thm fw-bold">${parseFloat(selectedProposal.budget).toLocaleString()}</p>
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold">Status:</h6>
                  <StatusBadge status={selectedProposal.status} />
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold">Cover Letter:</h6>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedProposal.cover_letter}</p>
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold">Submitted:</h6>
                  <p>{new Date(selectedProposal.submitted_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowProposalModal(false)}
                >
                  Close
                </button>
                <Link
                  href={`/project-single/${selectedProposal.project}`}
                  className="btn btn-primary"
                >
                  View Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}