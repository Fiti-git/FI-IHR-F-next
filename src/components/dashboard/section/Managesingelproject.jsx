"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import DashboardNavigation from "../header/DashboardNavigation";
import { useRouter } from "next/navigation";

export default function ManageSingleProject() {
  const params = useParams();
  const projectId = params.id;
  const router = useRouter();
  // State management
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Collapsible sections
  const [showProposals, setShowProposals] = useState(true);
  const [showSelectedFreelancer, setShowSelectedFreelancer] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showPayments, setShowPayments] = useState(true);
  
  // Action states
  const [processingProposal, setProcessingProposal] = useState(null);
  const [processingMilestone, setProcessingMilestone] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);
  
  // Revision modal state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [revisionNote, setRevisionNote] = useState("");
  
  // Cover letter modal state
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

  // API URLs
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project";

  // -------------------------------------------------------------------
// POST /api/chat/start/
// -------------------------------------------------------------------
const startChat = async (userId) => {
    let accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
    }
    if (!accessToken) throw new Error('No access token');

    const res = await fetch('http://127.0.0.1:8000/api/chat/start/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user_id: userId }),
    });

    if (!res.ok) {
        let txt = '';
        try { txt = await res.text(); } catch { }
        throw new Error(`Failed to start chat: ${res.status} ${txt}`);
    }

    return await res.json();
};

  const [showChatModal, setShowChatModal] = useState(false);
  const [currentChatApplicant, setCurrentChatApplicant] = useState(null);
  const [conversationId, setConversationId] = useState(null);

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

const handleStartChat = async (proposal) => {
  if (loading) return;
  setLoading(true);
  try {
    const userId = proposal.chat_users?.[0];
    if (!userId) throw new Error("No user ID found for this proposal.");
    const conversation = await startChat(userId);

    if (conversation?.id) {
      router.push(`/message?conversation_id=${conversation.id}`);
    } else {
      throw new Error("Conversation ID missing from server response.");
    }
  } catch (error) {
    console.error("Failed to start chat:", error);
    alert("Could not start chat: " + error.message);
  } finally {
    setLoading(false);
  }
};

// const handleStartChat = async (proposal) => {
//   try {
//     // The `chat_users` array directly provides the freelancer's user ID as the first element.
//     const userId = proposal.chat_users?.[0];

//     // Check if the user ID was found
//     if (!userId) {
//       throw new Error("Freelancer user ID is missing from the proposal data.");
//     }

//     const conversation = await startChat(userId);

//     if (conversation && conversation.id) {
//       // On success, redirect to the message page with the new conversation ID
//       router.push(`/message?conversation_id=${conversation.id}`);
//     } else {
//       throw new Error("Failed to get a conversation ID from the API response.");
//     }
//   } catch (error) {
//     console.error("Failed to start chat:", error);
//     alert(`Could not start chat: ${error.message}`);
//   }
// };

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

      setSuccess(`Proposal from ${freelancerName} accepted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      
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
      setError(err.message || "Failed to accept proposal");
      setTimeout(() => setError(null), 3000);
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

      setSuccess(`Proposal from ${freelancerName} rejected.`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchProposals();
    } catch (err) {
      console.error("Error rejecting proposal:", err);
      setError(err.message || "Failed to reject proposal");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingProposal(null);
    }
  };

  // Handle approve milestone (Client approves milestone setup)
  const handleApproveMilestone = async (milestoneId, milestoneName) => {
    if (!confirm(`Are you sure you want to approve the milestone: "${milestoneName}"?`)) {
      return;
    }

    try {
      setProcessingMilestone(milestoneId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/milestones/${milestoneId}/approve/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve milestone");
      }

      setSuccess(`Milestone "${milestoneName}" approved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchMilestones();
    } catch (err) {
      console.error("Error approving milestone:", err);
      setError(err.message || "Failed to approve milestone");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingMilestone(null);
    }
  };

  // Handle request revision for milestone
  const handleRequestRevision = async (milestoneId) => {
    if (!revisionNote.trim()) {
      alert("Please provide revision notes");
      return;
    }

    try {
      setProcessingMilestone(milestoneId);
      const token = localStorage.getItem('accessToken');
      
      // Update milestone status to 'revision_requested'
      const response = await fetch(`${API_URL}/milestones/${milestoneId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'revision_requested',
          revision_notes: revisionNote
        })
      });

      if (!response.ok) {
        throw new Error("Failed to request revision");
      }

      setSuccess("Revision requested successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setShowRevisionModal(false);
      setRevisionNote("");
      setSelectedMilestone(null);
      await fetchMilestones();
    } catch (err) {
      console.error("Error requesting revision:", err);
      setError(err.message || "Failed to request revision");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingMilestone(null);
    }
  };

  // Open revision modal
  const openRevisionModal = (milestone) => {
    setSelectedMilestone(milestone);
    setShowRevisionModal(true);
  };

  // Open cover letter modal
  const openCoverLetterModal = (proposal) => {
    setSelectedCoverLetter({
      freelancerName: proposal.freelancer?.first_name && proposal.freelancer?.last_name
        ? `${proposal.freelancer.first_name} ${proposal.freelancer.last_name}`
        : proposal.freelancer?.username,
      coverLetter: proposal.cover_letter,
      budget: proposal.budget,
      submittedAt: proposal.submitted_at
    });
    setShowCoverLetterModal(true);
  };

  // Handle create payment for completed milestone
  const handleCreatePayment = async (milestoneId, milestoneName, budget) => {
    if (!confirm(`Create payment of $${formatBudget(budget)} for milestone "${milestoneName}"?`)) {
      return;
    }

    try {
      setProcessingMilestone(milestoneId);
      const token = localStorage.getItem('accessToken');
      
      // Create payment record
      const response = await fetch(`${API_URL}/payments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          project: parseInt(projectId),
          milestone: milestoneId,
          freelancer: milestones.find(m => m.id === milestoneId)?.freelancer,
          payment_amount: budget,
          payment_status: 'pending',
          payment_method: 'platform_wallet'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create payment");
      }

      setSuccess("Payment created successfully! You can now release it.");
      setTimeout(() => setSuccess(null), 3000);
      await fetchPayments();
    } catch (err) {
      console.error("Error creating payment:", err);
      setError(err.message || "Failed to create payment");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingMilestone(null);
    }
  };

  // Handle payout (release payment)
  const handlePayout = async (paymentId, amount) => {
    if (!confirm(`Are you sure you want to release payment of $${formatBudget(amount)}?`)) {
      return;
    }

    try {
      setProcessingPayment(paymentId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/payments/${paymentId}/release_payment/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to release payment");
      }

      setSuccess("Payment released successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await fetchPayments();
      await fetchMilestones(); // Refresh milestones to update status
    } catch (err) {
      console.error("Error releasing payment:", err);
      setError(err.message || "Failed to release payment");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingPayment(null);
    }
  };

  // Handle chat with freelancer
  const handleChat = (freelancerId, freelancerName) => {
    // Redirect to chat page with freelancer
    window.location.href = `/dashboard/chat?user=${freelancerId}&name=${encodeURIComponent(freelancerName)}`;
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
      case "approved":
        return "badge bg-success";
      case "revision_requested":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  // Get status badge with icon
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning text-dark', icon: 'fa-clock', label: 'Pending Approval' },
      'approved': { class: 'bg-success', icon: 'fa-check-circle', label: 'Approved' },
      'in_progress': { class: 'bg-primary', icon: 'fa-spinner', label: 'In Progress' },
      'completed': { class: 'bg-info', icon: 'fa-flag-checkered', label: 'Completed - Review' },
      'payment_requested': { class: 'bg-warning', icon: 'fa-money-bill-wave', label: 'Payment Requested' },
      'paid': { class: 'bg-success', icon: 'fa-check-double', label: 'Paid' },
      'revision_requested': { class: 'bg-danger', icon: 'fa-redo', label: 'Revision Requested' }
    };

    const config = statusConfig[status] || { class: 'bg-secondary', icon: 'fa-question', label: status };

    return (
      <span className={`badge ${config.class}`}>
        <i className={`fal ${config.icon} me-1`}></i>
        {config.label}
      </span>
    );
  };

  // Get accepted proposal
  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  // Check if milestone has pending payment
  const getMilestonePayment = (milestoneId) => {
    return payments.find(p => p.milestone === milestoneId);
  };

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
  if (error && !project) {
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
        {/* Success/Error Messages */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fal fa-check-circle me-2"></i>
            <strong>Success!</strong> {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fal fa-exclamation-circle me-2"></i>
            <strong>Error!</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Title and Edit Button */}
        <div className="row pb40">
          <div className="col-lg-12">
            <div className="dashboard_title_area d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                {/* <h2>{project.title}</h2> */}
                <h2>{project?.title}</h2>

                <p className="text">Manage project details, proposals, and milestones</p>
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
{project ? (
  <>
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
  </>
) : (
  <div>Loading project details...</div>
)}


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
                    <i className="fal fa-file-alt me-2"></i>
                    Proposals ({proposals.length})
                  </h5>
                  <span className="fw-bold">{showProposals ? "−" : "+"}</span>
                </div>

                {showProposals && (
                  <div className="p30">
                    <div className="table-responsive">
                      <table className="table table-style3 at-savesearch mb-0 table-hover">
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
                              <td className="fw-bold text-success">${formatBudget(proposal.budget)}</td>
                              <td>
                                <span className={getStatusClass(proposal.status)}>
                                  {proposal.status?.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {proposal.cover_letter?.substring(0, 50)}
                                    {proposal.cover_letter?.length > 50 && '...'}
                                  </div>
                                  {proposal.cover_letter && (
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => openCoverLetterModal(proposal)}
                                      title="View full cover letter"
                                    >
                                      <i className="fal fa-eye"></i>
                                    </button>
                                  )}
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
                                          <>
                                            <i className="fal fa-check me-1"></i>
                                            Accept
                                          </>
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
                                        <i className="fal fa-times me-1"></i>
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => handleStartChat(proposal)}
                                    title="Chat with Freelancer"
                                  >
                                    <i className="fal fa-comment me-1"></i>
                                    Chat
                                  </button>
                                  <Link
                                    href={`/freelancer/${proposal.freelancer?.id}`}
                                    className="btn btn-sm btn-outline-primary"
                                    title="View Profile"
                                  >
                                    <i className="fal fa-user me-1"></i>
                                    Profile
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
                  <h5 className="fw500 mb-0">
                    <i className="fal fa-user-check me-2"></i>
                    Selected Freelancer
                  </h5>
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
                          <p className="mb-0 fw-bold text-success">Contract Budget: ${formatBudget(acceptedProposal.budget)}</p>
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

        {/* Milestones - CLIENT VIEW WITH APPROVAL/REVISION OPTIONS */}
        {milestones.length > 0 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 mb30 overflow-hidden position-relative">
                <div
                  className="d-flex justify-content-between align-items-center p30 border-bottom cursor-pointer"
                  onClick={() => setShowMilestones(!showMilestones)}
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="fw500 mb-0">
                    <i className="fal fa-tasks me-2"></i>
                    Milestones ({milestones.length})
                  </h5>
                  <span className="fw-bold">{showMilestones ? "−" : "+"}</span>
                </div>

                {showMilestones && (
                  <div className="p30">
                    {/* Milestone Workflow Info */}
                    <div className="alert alert-info mb-4" role="alert">
                      <h6 className="mb-2">
                        <i className="fal fa-info-circle me-2"></i>
                        Client Actions for Milestones
                      </h6>
                      <ul className="mb-0 ps-3">
                        <li><strong>Pending:</strong> Review and approve or request modifications</li>
                        <li><strong>Completed:</strong> Review work and either release payment or request revision</li>
                        <li><strong>In Progress:</strong> Freelancer is working on this milestone</li>
                      </ul>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-style3 at-savesearch mb-0 table-hover">
                        <thead className="t-head">
                          <tr>
                            <th>Milestone Details</th>
                            <th>Timeline</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="t-body">
                          {milestones.map((milestone) => {
                            const milestonePayment = getMilestonePayment(milestone.id);
                            
                            return (
                              <tr key={milestone.id}>
                                <td>
                                  <strong className="d-block mb-1">{milestone.name}</strong>
                                  <small className="text-muted">
                                    {milestone.description?.substring(0, 80)}
                                    {milestone.description?.length > 80 ? '...' : ''}
                                  </small>
                                </td>
                                <td>
                                  <div className="small">
                                    <div>
                                      <i className="fal fa-calendar-check me-1 text-success"></i>
                                      {formatDate(milestone.start_date)}
                                    </div>
                                    <div>
                                      <i className="fal fa-calendar-times me-1 text-danger"></i>
                                      {formatDate(milestone.end_date)}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <strong className="text-primary">${formatBudget(milestone.budget)}</strong>
                                </td>
                                <td>
                                  {getStatusBadge(milestone.status)}
                                </td>
                                <td>
                                  <div className="d-flex flex-column gap-2">
                                    {/* PENDING - Client needs to approve or modify */}
                                    {milestone.status === 'pending' && (
                                      <>
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() => handleApproveMilestone(milestone.id, milestone.name)}
                                          disabled={processingMilestone === milestone.id}
                                        >
                                          {processingMilestone === milestone.id ? (
                                            <>
                                              <span className="spinner-border spinner-border-sm me-1"></span>
                                              Approving...
                                            </>
                                          ) : (
                                            <>
                                              <i className="fal fa-check me-1"></i>
                                              Approve
                                            </>
                                          )}
                                        </button>
                                        <button
                                          className="btn btn-sm btn-warning"
                                          onClick={() => openRevisionModal(milestone)}
                                        >
                                          <i className="fal fa-edit me-1"></i>
                                          Request Changes
                                        </button>
                                      </>
                                    )}

                                    {/* APPROVED - Work can begin */}
                                    {milestone.status === 'approved' && (
                                      <span className="text-success small">
                                        <i className="fal fa-check-circle me-1"></i>
                                        Approved - Freelancer can start
                                      </span>
                                    )}

                                    {/* IN PROGRESS - Freelancer is working */}
                                    {milestone.status === 'in_progress' && (
                                      <span className="text-primary small">
                                        <i className="fal fa-spinner fa-spin me-1"></i>
                                        Work in progress
                                      </span>
                                    )}

                                    {/* COMPLETED - Client needs to review and pay */}
                                    {milestone.status === 'completed' && (
                                      <>
                                        {!milestonePayment ? (
                                          <>
                                            <button
                                              className="btn btn-sm btn-success"
                                              onClick={() => handleCreatePayment(
                                                milestone.id,
                                                milestone.name,
                                                milestone.budget
                                              )}
                                              disabled={processingMilestone === milestone.id}
                                            >
                                              {processingMilestone === milestone.id ? (
                                                <>
                                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                                  Processing...
                                                </>
                                              ) : (
                                                <>
                                                  <i className="fal fa-check-double me-1"></i>
                                                  Approve & Create Payment
                                                </>
                                              )}
                                            </button>
                                            <button
                                              className="btn btn-sm btn-danger"
                                              onClick={() => openRevisionModal(milestone)}
                                            >
                                              <i className="fal fa-redo me-1"></i>
                                              Request Revision
                                            </button>
                                          </>
                                        ) : (
                                          <span className="text-info small">
                                            <i className="fal fa-money-bill-wave me-1"></i>
                                            Payment created - check payments section
                                          </span>
                                        )}
                                      </>
                                    )}

                                    {/* REVISION REQUESTED */}
                                    {milestone.status === 'revision_requested' && (
                                      <span className="text-danger small">
                                        <i className="fal fa-redo me-1"></i>
                                        Awaiting freelancer revision
                                      </span>
                                    )}

                                    {/* PAID */}
                                    {milestone.status === 'paid' && (
                                      <span className="text-success small">
                                        <i className="fal fa-check-double me-1"></i>
                                        Payment released
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Milestone Statistics */}
                    <div className="row mt-4 pt-3 border-top">
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <h5 className="mb-0 text-warning">
                            {milestones.filter(m => m.status === 'pending').length}
                          </h5>
                          <small className="text-muted">Pending Approval</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <h5 className="mb-0 text-primary">
                            {milestones.filter(m => m.status === 'in_progress').length}
                          </h5>
                          <small className="text-muted">In Progress</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <h5 className="mb-0 text-info">
                            {milestones.filter(m => m.status === 'completed').length}
                          </h5>
                          <small className="text-muted">Awaiting Review</small>
                        </div>
                      </div>
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <h5 className="mb-0 text-success">
                            {milestones.filter(m => m.status === 'paid').length}
                          </h5>
                          <small className="text-muted">Completed & Paid</small>
                        </div>
                      </div>
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
                  <h5 className="fw500 mb-0">
                    <i className="fal fa-money-bill-wave me-2"></i>
                    Payments ({payments.length})
                  </h5>
                  <span className="fw-bold">{showPayments ? "−" : "+"}</span>
                </div>

                {showPayments && (
                  <div className="p30">
                    <div className="table-responsive">
                      <table className="table table-style3 at-savesearch mb-0 table-hover">
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
                              <td>{payment.milestone_name || milestones.find(m => m.id === payment.milestone)?.name || 'N/A'}</td>
                              <td className="fw-bold text-success">${formatBudget(payment.payment_amount)}</td>
                              <td>
                                <span className={getStatusClass(payment.payment_status)}>
                                  {payment.payment_status?.toUpperCase()}
                                </span>
                              </td>
                              <td className="text-capitalize">{payment.payment_method?.replace('_', ' ') || 'Platform Wallet'}</td>
                              <td>{formatDate(payment.created_at)}</td>
                              <td>{formatDate(payment.released_at) || '-'}</td>
                              <td>
                                {payment.payment_status === 'pending' && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handlePayout(payment.id, payment.payment_amount)}
                                    disabled={processingPayment === payment.id}
                                  >
                                    {processingPayment === payment.id ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Releasing...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fal fa-money-bill-wave me-1"></i>
                                        Release Payment
                                      </>
                                    )}
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

                    {/* Payment Summary */}
                    <div className="row mt-4 pt-3 border-top">
                      <div className="col-md-4">
                        <div className="text-center">
                          <h5 className="mb-0 text-primary">
                            ${formatBudget(payments.reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0))}
                          </h5>
                          <small className="text-muted">Total Payments</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <h5 className="mb-0 text-warning">
                            ${formatBudget(payments.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0))}
                          </h5>
                          <small className="text-muted">Pending Release</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <h5 className="mb-0 text-success">
                            ${formatBudget(payments.filter(p => p.payment_status === 'released').reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0))}
                          </h5>
                          <small className="text-muted">Released</small>
                        </div>
                      </div>
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

        {milestones.length === 0 && project.status === 'in_progress' && (
          <div className="row">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 p30 mb30 text-center">
                <i className="fal fa-tasks fa-3x text-muted mb-3"></i>
                <h5>No Milestones Yet</h5>
                <p className="text-muted">The freelancer will create milestones for your approval.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && selectedMilestone && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fal fa-edit me-2"></i>
                  Request Revision
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionNote("");
                    setSelectedMilestone(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  <strong>Milestone:</strong> {selectedMilestone.name}
                </p>
                <div className="mb-3">
                  <label htmlFor="revisionNote" className="form-label">
                    Revision Notes <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="revisionNote"
                    className="form-control"
                    rows="5"
                    placeholder="Please describe the changes or improvements you'd like to see..."
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    required
                  ></textarea>
                  <small className="text-muted">Be specific about what needs to be changed or improved.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionNote("");
                    setSelectedMilestone(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleRequestRevision(selectedMilestone.id)}
                  disabled={!revisionNote.trim() || processingMilestone === selectedMilestone.id}
                >
                  {processingMilestone === selectedMilestone.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fal fa-paper-plane me-2"></i>
                      Send Revision Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {showCoverLetterModal && selectedCoverLetter && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fal fa-envelope-open me-2"></i>
                  Cover Letter
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowCoverLetterModal(false);
                    setSelectedCoverLetter(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3 pb-3 border-bottom">
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-1">
                        <strong><i className="fal fa-user me-2"></i>Freelancer:</strong>
                      </p>
                      <p className="text-muted">{selectedCoverLetter.freelancerName}</p>
                    </div>
                    <div className="col-md-3">
                      <p className="mb-1">
                        <strong><i className="fal fa-dollar-sign me-2"></i>Budget:</strong>
                      </p>
                      <p className="text-success fw-bold">${formatBudget(selectedCoverLetter.budget)}</p>
                    </div>
                    <div className="col-md-3">
                      <p className="mb-1">
                        <strong><i className="fal fa-calendar me-2"></i>Submitted:</strong>
                      </p>
                      <p className="text-muted">{formatDate(selectedCoverLetter.submittedAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="cover-letter-content" style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  lineHeight: '1.6'
                }}>
                  {selectedCoverLetter.coverLetter || 'No cover letter provided.'}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCoverLetterModal(false);
                    setSelectedCoverLetter(null);
                  }}
                >
                  <i className="fal fa-times me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}