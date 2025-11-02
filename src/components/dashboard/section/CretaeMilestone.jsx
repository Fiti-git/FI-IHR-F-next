"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState, useEffect } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

export default function CreateMilestone() {
  // Project info - you might want to get this from props or route params
  const [project, setProject] = useState({
    id: 2,
    name: "Mobile App Development"
  });
  
  const [milestones, setMilestones] = useState([]);
  const [freelancers, setFreelancers] = useState([]);

  // Form state
  const [milestoneName, setMilestoneName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [freelancerId, setFreelancerId] = useState("");
  const [status, setStatus] = useState("pending");
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://206.189.134.117:8000/api/project/milestones/";

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    if (token) {
      fetchMilestones();
    }
  }, []);

  // Fetch existing milestones for this project
  const fetchMilestones = async () => {
    setFetchLoading(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_URL}?project_id=${project.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      } else if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = '/login';
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
      setIsAuthenticated(false);
      setTimeout(() => {
        window.location.href = '/login';
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
    if (!freelancerId) {
      setError("Please select a freelancer.");
      setLoading(false);
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (end <= start) {
      setError("End date must be after start date.");
      setLoading(false);
      return;
    }

    if (start < now) {
      setError("Start date must be in the future.");
      setLoading(false);
      return;
    }

    // Prepare milestone data
    const milestoneData = {
      project: project.id,
      freelancer_id: parseInt(freelancerId),
      name: milestoneName.trim(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      budget: parseFloat(budget),
      description: description.trim(),
      status: status
    };

    try {
      console.log("Creating milestone:", milestoneData);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(milestoneData),
      });

      console.log("Response status:", response.status);

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
          setIsAuthenticated(false);
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        } else if (response.status === 403) {
          setError("You don't have permission to create milestones.");
          return;
        } else if (response.status === 400) {
          // Handle validation errors
          if (errorData.name) {
            setError(`Name: ${Array.isArray(errorData.name) ? errorData.name[0] : errorData.name}`);
          } else if (errorData.start_date) {
            setError(`Start date: ${Array.isArray(errorData.start_date) ? errorData.start_date[0] : errorData.start_date}`);
          } else if (errorData.end_date) {
            setError(`End date: ${Array.isArray(errorData.end_date) ? errorData.end_date[0] : errorData.end_date}`);
          } else if (errorData.budget) {
            setError(`Budget: ${Array.isArray(errorData.budget) ? errorData.budget[0] : errorData.budget}`);
          } else if (errorData.description) {
            setError(`Description: ${Array.isArray(errorData.description) ? errorData.description[0] : errorData.description}`);
          } else if (errorData.freelancer_id) {
            setError(`Freelancer: ${Array.isArray(errorData.freelancer_id) ? errorData.freelancer_id[0] : errorData.freelancer_id}`);
          } else if (errorData.non_field_errors) {
            setError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else {
            setError("Invalid milestone data. Please check your input.");
          }
          return;
        }

        throw new Error(errorData.detail || errorData.message || "Failed to create milestone");
      }

      const data = await response.json();
      console.log("Milestone created successfully:", data);

      setSuccess("Milestone created successfully!");
      
      // Refresh milestones list
      fetchMilestones();

      // Clear form
      resetForm();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);

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

  // Delete milestone
  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm("Are you sure you want to delete this milestone?")) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_URL}${milestoneId}/`, {
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
          window.location.href = '/login';
        }, 2000);
      } else if (response.status === 403) {
        setError("You don't have permission to delete this milestone.");
      } else {
        setError("Failed to delete milestone");
      }
    } catch (err) {
      console.error("Error deleting milestone:", err);
      setError("Failed to delete milestone");
    }
  };

  // Reset form
  const resetForm = () => {
    setMilestoneName("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setDescription("");
    setFreelancerId("");
    setStatus("pending");
  };

  // Get today's date in YYYY-MM-DD format for min date
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

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>

          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Milestone</h2>
              <p className="text">Project Name: {project.name}</p>
            </div>
          </div>

          {/* Save/Refresh button on right */}
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
              
              {/* Authentication Warning */}
              {!isAuthenticated && (
                <div className="alert alert-warning mb-3" role="alert">
                  ⚠️ You need to be logged in to create milestones. 
                  <Link href="/login" className="ms-2 text-decoration-underline">
                    Login here
                  </Link>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="alert alert-success mb-3 d-flex align-items-center" role="alert">
                  <span className="me-2">✓</span>
                  <div>
                    <strong>Success!</strong> {success}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger mb-3 d-flex align-items-center" role="alert">
                  <span className="me-2">✕</span>
                  <div>
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}

              {/* Title above table */}
              <h4 className="mb-3">Milestones</h4>

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
                  <table className="table table-style3 at-savesearch">
                    <thead className="t-head">
                      <tr>
                        <th>Milestone Name</th>
                        <th>Freelancer</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Budget ($)</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="t-body">
                      {milestones.length > 0 ? (
                        milestones.map((m) => (
                          <tr key={m.id}>
                            <td>{m.name}</td>
                            <td>{m.freelancer?.username || 'N/A'}</td>
                            <td>{formatDate(m.start_date)}</td>
                            <td>{formatDate(m.end_date)}</td>
                            <td>${parseFloat(m.budget).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${
                                m.status === 'approved' ? 'bg-success' :
                                m.status === 'completed' ? 'bg-info' :
                                m.status === 'in_progress' ? 'bg-warning' :
                                'bg-secondary'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteMilestone(m.id)}
                                disabled={loading}
                              >
                                <i className="fal fa-trash-alt"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No milestones added yet. Create your first milestone below.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Add Milestone Form */}
              <div className="border-top pt-4">
                <h5 className="mb-3">Add New Milestone</h5>
                <form onSubmit={handleAddMilestone}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="milestoneName" className="form-label">
                        Milestone Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="milestoneName"
                        type="text"
                        className="form-control"
                        placeholder="e.g., Initial Design Phase"
                        value={milestoneName}
                        onChange={(e) => setMilestoneName(e.target.value)}
                        disabled={loading || !isAuthenticated}
                        maxLength={255}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="freelancerId" className="form-label">
                        Freelancer <span className="text-danger">*</span>
                      </label>
                      <input
                        id="freelancerId"
                        type="number"
                        className="form-control"
                        placeholder="Enter Freelancer ID"
                        value={freelancerId}
                        onChange={(e) => setFreelancerId(e.target.value)}
                        disabled={loading || !isAuthenticated}
                      />
                      <small className="text-muted">Enter the ID of the assigned freelancer</small>
                    </div>

                    <div className="col-md-3">
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
                        disabled={loading || !isAuthenticated}
                      />
                    </div>

                    <div className="col-md-3">
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
                        disabled={loading || !isAuthenticated}
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="budget" className="form-label">
                        Budget ($) <span className="text-danger">*</span>
                      </label>
                      <input
                        id="budget"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control"
                        placeholder="1000.00"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        disabled={loading || !isAuthenticated}
                      />
                    </div>

                    <div className="col-md-3">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select
                        id="status"
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading || !isAuthenticated}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label htmlFor="description" className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows={3}
                        placeholder="Describe the milestone objectives and deliverables..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading || !isAuthenticated}
                        maxLength={2000}
                      />
                      <small className="text-muted">{description.length}/2000 characters</small>
                    </div>

                    <div className="col-md-12">
                      <div className="d-flex gap-2">
                        <button 
                          type="submit" 
                          className="btn btn-success"
                          disabled={loading || !isAuthenticated}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <i className="fal fa-plus me-2"></i>
                              Add Milestone
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
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

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