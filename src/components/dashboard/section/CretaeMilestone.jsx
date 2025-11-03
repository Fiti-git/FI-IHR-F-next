"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

export default function CreateMilestone() {
  const router = useRouter();
  const params = useParams();
  
  // Get project info from URL params
  const [project, setProject] = useState({
    id: params?.id || null,
    name: "Loading..."
  });
  
  const [milestones, setMilestones] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [verifying, setVerifying] = useState(true);

  // Form state
  const [milestoneName, setMilestoneName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // Track loading state for individual actions

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://206.189.134.117:8000/api/project/milestones/";

  // Verify freelancer access on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    
    if (!token) {
      setVerifying(false);
      setAccessError("Please log in to access this page");
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }
    
    if (!project.id) {
      setVerifying(false);
      setAccessError("No project specified");
      setTimeout(() => {
        router.push('/freelancer-projects');
      }, 2000);
      return;
    }
    
    verifyFreelancerAccess();
  }, [project.id]);

  // Verify if freelancer has access to this project
  const verifyFreelancerAccess = async () => {
    setVerifying(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(
        `${API_URL}milestones/verify_freelancer_access/?project_id=${project.id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.has_access) {
        setHasAccess(true);
        setProject(prev => ({
          ...prev,
          name: data.project_name
        }));
        fetchMilestones();
      } else {
        setHasAccess(false);
        
        if (data.is_project_owner) {
          setAccessError("You are the project owner. Only assigned freelancers can create milestones.");
        } else {
          setAccessError(data.error || "You don't have permission to create milestones for this project");
        }
        
        setTimeout(() => {
          router.push('/freelancer-projects');
        }, 3000);
      }
    } catch (err) {
      console.error("Error verifying access:", err);
      setAccessError("Failed to verify access. Please try again.");
      setTimeout(() => {
        router.push('/freelancer-projects');
      }, 3000);
    } finally {
      setVerifying(false);
    }
  };

  // Fetch existing milestones for this project
  const fetchMilestones = async () => {
    setFetchLoading(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(
        `${API_URL}milestones/?project_id=${project.id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const milestonesArray = data.results ? data.results : data;
        setMilestones(milestonesArray);
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error("Error fetching milestones:", err);
      setError("Failed to load milestones");
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle form submission - Create milestone
  const handleAddMilestone = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Please log in to create a milestone");
      setLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    // Validate inputs
    if (!milestoneName.trim()) {
      setError("Please enter milestone name.");
      setLoading(false);
      return;
    }
    if (!startDate) {
      setError("Please enter start date.");
      setLoading(false);
      return;
    }
    if (!endDate) {
      setError("Please enter end date.");
      setLoading(false);
      return;
    }
    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      setError("Please enter a valid budget.");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError("Please enter milestone description.");
      setLoading(false);
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (end <= start) {
      setError("End date must be after start date.");
      setLoading(false);
      return;
    }

    if (start < now) {
      setError("Start date must be today or in the future.");
      setLoading(false);
      return;
    }

    // Prepare milestone data - status is 'pending' by default (waiting for client approval)
    const milestoneData = {
      project: parseInt(project.id),
      name: milestoneName.trim(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      budget: parseFloat(budget),
      description: description.trim(),
      status: "pending" // Pending client approval
    };

    try {
      console.log("Creating milestone:", milestoneData);

      const response = await fetch(`${API_URL}milestones/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(milestoneData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("API Error Response:", errorData);
        } catch (parseError) {
          errorData = { message: "Failed to parse error response" };
        }

        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setError("Session expired. Please log in again.");
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        } else if (response.status === 403) {
          setError(errorData.detail || "You don't have permission to create milestones for this project.");
          return;
        } else if (response.status === 400) {
          // Handle validation errors
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0) {
            const firstError = errorData[errorKeys[0]];
            setError(`${errorKeys[0]}: ${Array.isArray(firstError) ? firstError[0] : firstError}`);
          } else {
            setError("Invalid milestone data. Please check your input.");
          }
          return;
        }

        throw new Error(errorData.detail || errorData.message || "Failed to create milestone");
      }

      const data = await response.json();
      console.log("Milestone created successfully:", data);

      setSuccess("Milestone created successfully! It has been sent to the client for approval.");
      
      // Refresh milestones list
      fetchMilestones();

      // Clear form
      resetForm();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);

    } catch (err) {
      console.error("Error creating milestone:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An unexpected error occurred while creating the milestone");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark milestone as completed (freelancer action)
  const handleMarkAsCompleted = async (milestoneId) => {
    if (!confirm("Are you sure you want to mark this milestone as completed? This will notify the client for review.")) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [milestoneId]: 'completing' }));
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_URL}milestones/${milestoneId}/complete/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setSuccess("Milestone marked as completed! Payment request sent to client.");
        fetchMilestones();
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (response.status === 403) {
        setError("You don't have permission to complete this milestone.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to mark milestone as completed");
      }
    } catch (err) {
      console.error("Error completing milestone:", err);
      setError("Failed to mark milestone as completed");
    } finally {
      setActionLoading(prev => ({ ...prev, [milestoneId]: false }));
    }
  };

  // Update milestone status (freelancer can change status)
  const handleUpdateMilestoneStatus = async (milestoneId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [milestoneId]: 'updating' }));
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_URL}milestones/${milestoneId}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`Milestone status updated to "${newStatus.replace('_', ' ')}"!`);
        fetchMilestones();
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (response.status === 403) {
        setError("You don't have permission to update this milestone.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.detail || "Failed to update milestone status");
      }
    } catch (err) {
      console.error("Error updating milestone:", err);
      setError("Failed to update milestone status");
    } finally {
      setActionLoading(prev => ({ ...prev, [milestoneId]: false }));
    }
  };

  // Delete milestone
  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm("Are you sure you want to delete this milestone?")) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [milestoneId]: 'deleting' }));
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_URL}milestones/${milestoneId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess("Milestone deleted successfully!");
        fetchMilestones();
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (response.status === 403) {
        const errorData = await response.json();
        setError(errorData.detail || "You don't have permission to delete this milestone.");
      } else {
        setError("Failed to delete milestone");
      }
    } catch (err) {
      console.error("Error deleting milestone:", err);
      setError("Failed to delete milestone");
    } finally {
      setActionLoading(prev => ({ ...prev, [milestoneId]: false }));
    }
  };

  // Reset form
  const resetForm = () => {
    setMilestoneName("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setDescription("");
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning text-dark', icon: 'fa-clock', label: 'Pending Approval' },
      'approved': { class: 'bg-success', icon: 'fa-check-circle', label: 'Approved' },
      'in_progress': { class: 'bg-primary', icon: 'fa-spinner', label: 'In Progress' },
      'completed': { class: 'bg-info', icon: 'fa-flag-checkered', label: 'Completed' },
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

  // Get available status transitions for freelancer
  const getAvailableStatusOptions = (currentStatus) => {
    const statusOptions = {
      'pending': [],
      'approved': ['in_progress'],
      'in_progress': ['completed'],
      'completed': [], // Client approves or requests revision
      'payment_requested': [], // Waiting for client
      'revision_requested': ['in_progress'],
      'paid': []
    };

    return statusOptions[currentStatus] || [];
  };

  // Show loading/verification state
  if (verifying) {
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
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5>Verifying Access...</h5>
              <p className="text-muted">Please wait while we verify your permissions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (!hasAccess) {
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
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="fal fa-exclamation-triangle fa-2x me-3"></i>
                <div>
                  <h5 className="mb-2">Access Denied</h5>
                  <p className="mb-0">{accessError}</p>
                  <p className="mt-2 mb-0">
                    <small>Redirecting to your projects...</small>
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/freelancer-projects" className="btn btn-primary">
                  <i className="fal fa-arrow-left me-2"></i>
                  Back to My Projects
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
              <h2>Milestone Management</h2>
              <p className="text">Project: <strong>{project.name}</strong></p>
              <div className="mt-2">
                <Link 
                  href="/freelancer-projects" 
                  className="text-decoration-none"
                >
                  <i className="fal fa-arrow-left me-2"></i>
                  Back to My Projects
                </Link>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <div className="col-lg-3">
            <div className="text-lg-end">
              <button
                className="ud-btn btn-dark default-box-shadow2"
                onClick={fetchMilestones}
                disabled={fetchLoading}
              >
                {fetchLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fal fa-sync me-2"></i>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              
              {/* Success Message */}
              {success && (
                <div className="alert alert-success mb-3 d-flex align-items-center alert-dismissible fade show" role="alert">
                  <i className="fal fa-check-circle me-2"></i>
                  <div>
                    <strong>Success!</strong> {success}
                  </div>
                  <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger mb-3 d-flex align-items-center alert-dismissible fade show" role="alert">
                  <i className="fal fa-exclamation-circle me-2"></i>
                  <div>
                    <strong>Error:</strong> {error}
                  </div>
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}

              {/* Workflow Info */}
              <div className="alert alert-info mb-4" role="alert">
                <h6 className="mb-2">
                  <i className="fal fa-info-circle me-2"></i>
                  Milestone Workflow
                </h6>
                <ol className="mb-0 ps-3">
                  <li><strong>Create Milestones:</strong> Add milestones with timeline and budget</li>
                  <li><strong>Pending Approval:</strong> Milestones are sent to client for approval</li>
                  <li><strong>Approved:</strong> Client approves - Start working</li>
                  <li><strong>In Progress:</strong> You are working on the milestone</li>
                  <li><strong>Completed:</strong> Mark as done to request payment</li>
                  <li><strong>Client Reviews:</strong> Client approves payment or requests revision</li>
                </ol>
              </div>

              {/* Title above table */}
              <h4 className="mb-3">
                <i className="fal fa-tasks me-2"></i>
                Project Milestones
              </h4>

              {/* Milestones Table */}
              <div className="table-responsive mb-4">
                {fetchLoading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading milestones...</p>
                  </div>
                ) : (
                  <table className="table table-style3 at-savesearch table-hover">
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
                      {milestones.length > 0 ? (
                        milestones.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <strong className="d-block mb-1">{m.name}</strong>
                              <small className="text-muted">{m.description?.substring(0, 80)}{m.description?.length > 80 ? '...' : ''}</small>
                            </td>
                            <td>
                              <div className="small">
                                <div><i className="fal fa-calendar-check me-1 text-success"></i> {formatDate(m.start_date)}</div>
                                <div><i className="fal fa-calendar-times me-1 text-danger"></i> {formatDate(m.end_date)}</div>
                              </div>
                            </td>
                            <td>
                              <strong className="text-primary">${parseFloat(m.budget).toFixed(2)}</strong>
                            </td>
                            <td>
                              {getStatusBadge(m.status)}
                              
                              {/* Status Change Dropdown */}
                              {getAvailableStatusOptions(m.status).length > 0 && (
                                <div className="mt-2">
                                  <select
                                    className="form-select form-select-sm"
                                    value={m.status}
                                    onChange={(e) => handleUpdateMilestoneStatus(m.id, e.target.value)}
                                    disabled={actionLoading[m.id]}
                                  >
                                    <option value={m.status}>Change Status...</option>
                                    {getAvailableStatusOptions(m.status).map(status => (
                                      <option key={status} value={status}>
                                        {status.replace('_', ' ').toUpperCase()}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                {/* Mark as Completed button - only show for in_progress milestones */}
                                {m.status === 'in_progress' && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleMarkAsCompleted(m.id)}
                                    disabled={actionLoading[m.id]}
                                    title="Mark as completed and request payment"
                                  >
                                    {actionLoading[m.id] === 'completing' ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Completing...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fal fa-check me-1"></i>
                                        Mark Done
                                      </>
                                    )}
                                  </button>
                                )}

                                {/* Delete button - can't delete approved or paid milestones */}
                                {m.status !== 'approved' && m.status !== 'paid' && m.status !== 'completed' && (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteMilestone(m.id)}
                                    disabled={actionLoading[m.id]}
                                    title="Delete milestone"
                                  >
                                    {actionLoading[m.id] === 'deleting' ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <i className="fal fa-trash-alt me-1"></i>
                                        Delete
                                      </>
                                    )}
                                  </button>
                                )}

                                {/* Info for different statuses */}
                                {m.status === 'pending' && (
                                  <small className="text-muted">
                                    <i className="fal fa-hourglass me-1"></i>
                                    Awaiting client approval
                                  </small>
                                )}
                                {m.status === 'completed' && (
                                  <small className="text-info">
                                    <i className="fal fa-clock me-1"></i>
                                    Pending client review
                                  </small>
                                )}
                                {m.status === 'paid' && (
                                  <small className="text-success">
                                    <i className="fal fa-check-double me-1"></i>
                                    Payment released
                                  </small>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <i className="fal fa-tasks fa-3x text-muted mb-3 d-block"></i>
                            <p className="text-muted mb-0">No milestones created yet. Add your first milestone below to get started.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Add Milestone Form */}
              <div className="border-top pt-4">
                <h5 className="mb-3">
                  <i className="fal fa-plus-circle me-2"></i>
                  Create New Milestone
                </h5>
                <p className="text-muted mb-4">
                  <i className="fal fa-lightbulb me-1"></i>
                  Create milestones with clear deliverables and timelines. Once created, they will be sent to the client for approval.
                </p>
                <form onSubmit={handleAddMilestone}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-8">
                      <label htmlFor="milestoneName" className="form-label">
                        Milestone Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="milestoneName"
                        type="text"
                        className="form-control"
                        placeholder="e.g., Design Mockups, Homepage Development, Testing Phase"
                        value={milestoneName}
                        onChange={(e) => setMilestoneName(e.target.value)}
                        disabled={loading}
                        maxLength={255}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="budget" className="form-label">
                        Budget ($) <span className="text-danger">*</span>
                      </label>
                      <input
                        id="budget"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control"
                        placeholder="e.g., 300.00"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="startDate" className="form-label">
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        className="form-control"
                        min={getTodayDate()}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <small className="text-muted">When will you start working on this milestone?</small>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="endDate" className="form-label">
                        End Date <span className="text-danger">*</span>
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        className="form-control"
                        min={startDate || getTodayDate()}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={loading}
                        required
                      />
                      <small className="text-muted">Expected completion date</small>
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="description" className="form-label">
                        Description & Deliverables <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows={4}
                        placeholder="Describe the milestone objectives, deliverables, and acceptance criteria in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        maxLength={2000}
                        required
                      />
                      <small className="text-muted">{description.length}/2000 characters</small>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex gap-2">
                        <button 
                          type="submit" 
                          className="btn btn-success"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fal fa-plus me-2"></i>
                              Add Milestone & Send for Approval
                            </>
                          )}
                        </button>
                        
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={resetForm}
                          disabled={loading}
                        >
                          <i className="fal fa-redo me-2"></i>
                          Reset Form
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Statistics Summary */}
              {milestones.length > 0 && (
                <div className="border-top pt-4 mt-4">
                  <h6 className="mb-3">
                    <i className="fal fa-chart-bar me-2"></i>
                    Milestone Statistics
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="card border-warning">
                        <div className="card-body text-center">
                          <h4 className="mb-0">{milestones.filter(m => m.status === 'pending').length}</h4>
                          <small className="text-muted">Pending Approval</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-primary">
                        <div className="card-body text-center">
                          <h4 className="mb-0">{milestones.filter(m => m.status === 'in_progress').length}</h4>
                          <small className="text-muted">In Progress</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-info">
                        <div className="card-body text-center">
                          <h4 className="mb-0">{milestones.filter(m => m.status === 'completed').length}</h4>
                          <small className="text-muted">Awaiting Review</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-success">
                        <div className="card-body text-center">
                          <h4 className="mb-0">{milestones.filter(m => m.status === 'paid').length}</h4>
                          <small className="text-muted">Completed & Paid</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <strong>Total Budget:</strong> ${milestones.reduce((sum, m) => sum + parseFloat(m.budget), 0).toFixed(2)}
                    <span className="ms-3">
                      <strong>Earned:</strong> ${milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + parseFloat(m.budget), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Pagination if needed */}
              {milestones.length > 10 && (
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