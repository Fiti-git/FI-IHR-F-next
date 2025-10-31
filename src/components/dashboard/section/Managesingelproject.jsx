"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import DashboardNavigation from "../header/DashboardNavigation";

export default function ManageSingleProject() {
  const params = useParams();
  const projectId = params.id;
  
  // State management
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Collapsible sections
  const [showProposals, setShowProposals] = useState(true);
  const [showSelectedFreelancer, setShowSelectedFreelancer] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showPayments, setShowPayments] = useState(true);
  
  // Action states
  const [processingProposal, setProcessingProposal] = useState(null);

  // API URLs
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project";

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    
    if (token && projectId) {
      fetchProjectDetails();
      fetchProposals();
      fetchMilestones();
      fetchPayments();
    } else {
      setLoading(false);
      setError("Please log in to view project details");
    }
  }, [projectId]);

  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/projects/${projectId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err.message);
    }
  };

  // Fetch proposals for this project
  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/proposals/?project_id=${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProposals(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };

  // Fetch milestones for this project
  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/milestones/?project_id=${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMilestones(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Error fetching milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments for this project
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/?project_id=${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // Handle accept proposal
  const handleAcceptProposal = async (proposalId, freelancerName) => {
    if (!confirm(`Are you sure you want to accept the proposal from ${freelancerName}?`)) {
      return;
    }

    try {
      setProcessingProposal(proposalId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/proposals/${proposalId}/accept/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept proposal");
      }

      alert(`Proposal from ${freelancerName} accepted successfully!`);
      
      // Refresh data
      await fetchProposals();
      await fetchProjectDetails();
      
      // Update project status to in_progress
      await fetch(`${API_URL}/projects/${projectId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'in_progress' })
      });
      
    } catch (err) {
      console.error("Error accepting proposal:", err);
      alert(err.message || "Failed to accept proposal");
    } finally {
      setProcessingProposal(null);
    }
  };

  // Handle reject proposal
  const handleRejectProposal = async (proposalId, freelancerName) => {
    if (!confirm(`Are you sure you want to reject the proposal from ${freelancerName}?`)) {
      return;
    }

    try {
      setProcessingProposal(proposalId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/proposals/${proposalId}/reject/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reject proposal");
      }

      alert(`Proposal from ${freelancerName} rejected.`);
      await fetchProposals();
    } catch (err) {
      console.error("Error rejecting proposal:", err);
      alert(err.message || "Failed to reject proposal");
    } finally {
      setProcessingProposal(null);
    }
  };

  // Handle chat with freelancer
  const handleChat = (freelancerId, freelancerName) => {
    // Redirect to chat page with freelancer
    window.location.href = `/dashboard/chat?user=${freelancerId}&name=${encodeURIComponent(freelancerName)}`;
  };

  // Handle payout
  const handlePayout = async (paymentId) => {
    if (!confirm("Are you sure you want to release this payment?")) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/${paymentId}/release_payment/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to release payment");
      }

      alert("Payment released successfully!");
      await fetchPayments();
    } catch (err) {
      console.error("Error releasing payment:", err);
      alert(err.message || "Failed to release payment");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format budget
  const formatBudget = (budget) => {
    if (!budget) return "0.00";
    return parseFloat(budget).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "badge bg-success";
      case "in_progress":
        return "badge bg-primary";
      case "completed":
        return "badge bg-info";
      case "accepted":
        return "badge bg-success";
      case "rejected":
        return "badge bg-danger";
      case "submitted":
        return "badge bg-warning";
      case "paid":
      case "released":
        return "badge bg-success";
      case "pending":
        return "badge bg-warning";
      default:
        return "badge bg-secondary";
    }
  };

  // Get accepted proposal
  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  // Loading state
  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
        </div>
        <div className="container mt-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
        </div>
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error || "Project not found"}</p>
            <hr />
            <Link href="/manage-projects" className="btn btn-primary">
              Back to My Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard__content hover-bgc-color">
      <div className="row pb40">
        <div className="col-lg-12">
          <DashboardNavigation />
        </div>
      </div>

      <div className="container">
        {/* Title and Edit Button */}
        <div className="row pb40">
          <div className="col-lg-12">
            <div className="dashboard_title_area d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h2>{project.title}</h2>
                <p className="text">Manage project details and proposals</p>
              </div>
              <div className="d-flex gap-2">
                <Link
                  href={`/edit-project/${project.id}`}
                  className="ud-btn btn-dark default-box-shadow2"
                >
                  Edit Project <i className="fal fa-edit" />
                </Link>
                <Link
                  href="/manage-projects"
                  className="ud-btn btn-white"
                >
                  <i className="fal fa-arrow-left me-2" />
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details Box */}
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <h5 className="fw500 mb-3">Project Details</h5>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <p className="mb-2"><strong>Description:</strong></p>
                  <p className="text-muted">{project.description}</p>
                </div>
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-sm-6 mb-3">
                      <p className="mb-1"><strong>Posted Date:</strong></p>
                      <p className="text-muted">{formatDate(project.created_at)}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <p className="mb-1"><strong>Status:</strong></p>
                      <span className={getStatusClass(project.status)}>
                        {project.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <p className="mb-1"><strong>Category:</strong></p>
                      <p className="text-muted">{project.category}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <p className="mb-1"><strong>Budget:</strong></p>
                      <p className="text-muted fw-bold">${formatBudget(project.budget)}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <p className="mb-1"><strong>Project Type:</strong></p>
                      <p className="text-muted text-capitalize">{project.project_type?.replace('_', ' ')}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <p className="mb-1"><strong>Deadline:</strong></p>
                      <p className="text-muted">{formatDate(project.deadline)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Statistics */}
              <div className="row mt-4 pt-3 border-top">
                <div className="col-md-3 col-6 mb-3">
                  <div className="text-center">
                    <h4 className="mb-0 text-primary">{proposals.length}</h4>
                    <small className="text-muted">Total Proposals</small>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="text-center">
                    <h4 className="mb-0 text-success">
                      {proposals.filter(p => p.status === 'accepted').length}
                    </h4>
                    <small className="text-muted">Accepted</small>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="text-center">
                    <h4 className="mb-0 text-info">{milestones.length}</h4>
                    <small className="text-muted">Milestones</small>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                  <div className="text-center">
                    <h4 className="mb-0 text-warning">{payments.length}</h4>
                    <small className="text-muted">Payments</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposal List (if project is OPEN or has proposals) */}
        {proposals.length > 0 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 mb30 overflow-hidden position-relative">
                <div
                  className="d-flex justify-content-between align-items-center p30 border-bottom cursor-pointer"
                  onClick={() => setShowProposals(!showProposals)}
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="fw500 mb-0">
                    Proposals ({proposals.length})
                  </h5>
                  <span className="fw-bold">{showProposals ? "−" : "+"}</span>
                </div>

                {showProposals && (
                  <div className="p30">
                    <div className="table-responsive">
                      <table className="table table-style3 at-savesearch mb-0">
                        <thead className="t-head">
                          <tr>
                            <th>Freelancer</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Cover Letter</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="t-body">
                          {proposals.map((proposal) => (
                            <tr key={proposal.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="thumb w40 position-relative rounded-circle me-2">
                                    <img
                                      src={proposal.freelancer?.profile_image || "/images/team/default-avatar.png"}
                                      alt={proposal.freelancer?.username}
                                      className="rounded-circle"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                  </div>
                                  <div>
                                    <h6 className="mb-0">
                                      {proposal.freelancer?.first_name && proposal.freelancer?.last_name
                                        ? `${proposal.freelancer.first_name} ${proposal.freelancer.last_name}`
                                        : proposal.freelancer?.username}
                                    </h6>
                                    <small className="text-muted">{proposal.freelancer?.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="fw-bold">${formatBudget(proposal.budget)}</td>
                              <td>
                                <span className={getStatusClass(proposal.status)}>
                                  {proposal.status?.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ maxWidth: '200px' }}>
                                  {proposal.cover_letter?.substring(0, 50)}
                                  {proposal.cover_letter?.length > 50 && '...'}
                                </div>
                              </td>
                              <td>{formatDate(proposal.submitted_at)}</td>
                              <td>
                                <div className="d-flex gap-2 flex-wrap">
                                  {proposal.status === 'submitted' && project.status === 'open' && (
                                    <>
                                      <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleAcceptProposal(
                                          proposal.id,
                                          proposal.freelancer?.first_name || proposal.freelancer?.username
                                        )}
                                        disabled={processingProposal === proposal.id}
                                        title="Accept Proposal"
                                      >
                                        {processingProposal === proposal.id ? (
                                          <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                          <i className="fal fa-check"></i>
                                        )}
                                      </button>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRejectProposal(
                                          proposal.id,
                                          proposal.freelancer?.first_name || proposal.freelancer?.username
                                        )}
                                        disabled={processingProposal === proposal.id}
                                        title="Reject Proposal"
                                      >
                                        <i className="fal fa-times"></i>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => handleChat(
                                      proposal.freelancer?.id,
                                      proposal.freelancer?.first_name || proposal.freelancer?.username
                                    )}
                                    title="Chat with Freelancer"
                                  >
                                    <i className="fal fa-comment"></i>
                                  </button>
                                  <Link
                                    href={`/freelancer/${proposal.freelancer?.id}`}
                                    className="btn btn-sm btn-outline-primary"
                                    title="View Profile"
                                  >
                                    <i className="fal fa-user"></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Freelancer (if project is IN_PROGRESS) */}
        {project.status === 'in_progress' && acceptedProposal && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 mb30 overflow-hidden position-relative">
                <div
                  className="d-flex justify-content-between align-items-center p30 border-bottom cursor-pointer"
                  onClick={() => setShowSelectedFreelancer(!showSelectedFreelancer)}
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="fw500 mb-0">Selected Freelancer</h5>
                  <span className="fw-bold">{showSelectedFreelancer ? "−" : "+"}</span>
                </div>

                {showSelectedFreelancer && (
                  <div className="p30">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div className="d-flex align-items-center">
                        <div className="thumb w60 position-relative rounded-circle me-3">
                          <img
                            src={acceptedProposal.freelancer?.profile_image || "/images/team/default-avatar.png"}
                            alt={acceptedProposal.freelancer?.username}
                            className="rounded-circle"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h5 className="mb-1">
                            {acceptedProposal.freelancer?.first_name && acceptedProposal.freelancer?.last_name
                              ? `${acceptedProposal.freelancer.first_name} ${acceptedProposal.freelancer.last_name}`
                              : acceptedProposal.freelancer?.username}
                          </h5>
                          <p className="mb-0 text-muted">{acceptedProposal.freelancer?.email}</p>
                          <p className="mb-0 fw-bold text-success">Budget: ${formatBudget(acceptedProposal.budget)}</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleChat(
                            acceptedProposal.freelancer?.id,
                            acceptedProposal.freelancer?.first_name || acceptedProposal.freelancer?.username
                          )}
                        >
                          <i className="fal fa-comment me-2"></i>
                          Chat
                        </button>
                        <Link
                          href={`/freelancer/${acceptedProposal.freelancer?.id}`}
                          className="btn btn-outline-primary"
                        >
                          <i className="fal fa-user me-2"></i>
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 mb30 overflow-hidden position-relative">
                <div
                  className="d-flex justify-content-between align-items-center p30 border-bottom cursor-pointer"
                  onClick={() => setShowMilestones(!showMilestones)}
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="fw500 mb-0">Milestones ({milestones.length})</h5>
                  <span className="fw-bold">{showMilestones ? "−" : "+"}</span>
                </div>

                {showMilestones && (
                  <div className="p30">
                    <div className="table-responsive">
                      <table className="table table-style3 at-savesearch mb-0">
                        <thead className="t-head">
                          <tr>
                            <th>Milestone Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody className="t-body">
                          {milestones.map((milestone) => (
                            <tr key={milestone.id}>
                              <td className="fw-bold">{milestone.name}</td>
                              <td>{formatDate(milestone.start_date)}</td>
                              <td>{formatDate(milestone.end_date)}</td>
                              <td className="fw-bold">${formatBudget(milestone.budget)}</td>
                              <td>
                                <span className={getStatusClass(milestone.status)}>
                                  {milestone.status?.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ maxWidth: '200px' }}>
                                  {milestone.description?.substring(0, 50)}
                                  {milestone.description?.length > 50 && '...'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payments */}
        {payments.length > 0 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 mb30 overflow-hidden position-relative">
                <div
                  className="d-flex justify-content-between align-items-center p30 border-bottom cursor-pointer"
                  onClick={() => setShowPayments(!showPayments)}
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="fw500 mb-0">Payments ({payments.length})</h5>
                  <span className="fw-bold">{showPayments ? "−" : "+"}</span>
                </div>

                {showPayments && (
                  <div className="p30">
                    <div className="table-responsive">
                      <table className="table table-style3 at-savesearch mb-0">
                        <thead className="t-head">
                          <tr>
                            <th>Payment ID</th>
                            <th>Milestone</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment Method</th>
                            <th>Created</th>
                            <th>Released</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="t-body">
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="fw-bold">#{payment.id}</td>
                              <td>{payment.milestone_name || 'N/A'}</td>
                              <td className="fw-bold text-success">${formatBudget(payment.payment_amount)}</td>
                              <td>
                                <span className={getStatusClass(payment.payment_status)}>
                                  {payment.payment_status?.toUpperCase()}
                                </span>
                              </td>
                              <td>{payment.payment_method || 'N/A'}</td>
                              <td>{formatDate(payment.created_at)}</td>
                              <td>{formatDate(payment.released_at) || '-'}</td>
                              <td>
                                {payment.payment_status !== 'released' && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handlePayout(payment.id)}
                                  >
                                    <i className="fal fa-money-bill-wave me-1"></i>
                                    Release Payment
                                  </button>
                                )}
                                {payment.payment_status === 'released' && (
                                  <span className="text-success">
                                    <i className="fal fa-check-circle me-1"></i>
                                    Paid
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty States */}
        {proposals.length === 0 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
                <i className="fal fa-inbox fa-3x text-muted mb-3"></i>
                <h5>No Proposals Yet</h5>
                <p className="text-muted">Waiting for freelancers to submit proposals for this project.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}