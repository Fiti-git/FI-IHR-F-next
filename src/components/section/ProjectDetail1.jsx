"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Sticky from "react-stickynode";
import ProjectPriceWidget1 from "../element/ProjectPriceWidget1";
import ProjectContactWidget1 from "../element/ProjectContactWidget1";
import useScreen from "@/hook/useScreen";

export default function ProjectDetail1() {
  const isMatchedScreen = useScreen(1216);
  const { id } = useParams();
  
  // State management
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposalBudget, setProposalBudget] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [proposalError, setProposalError] = useState(null);

  // API URLs
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project";

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/projects/${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched project details:", data);
        setProjectData(data);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.message || "Failed to fetch project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, API_URL]);

  // Handle proposal submission
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setProposalError(null);
    setProposalSuccess(false);

    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setProposalError("Please log in to submit a proposal");
      setSubmitting(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Validate inputs
    if (!proposalBudget || parseFloat(proposalBudget) <= 0) {
      setProposalError("Please enter a valid budget");
      setSubmitting(false);
      return;
    }

    if (!coverLetter.trim()) {
      setProposalError("Please write a cover letter");
      setSubmitting(false);
      return;
    }

    try {
      const proposalData = {
        project: projectData.id,
        budget: parseFloat(proposalBudget),
        cover_letter: coverLetter.trim(),
      };

      const response = await fetch(`${API_URL}/proposals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setProposalError("Session expired. Please log in again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }

        throw new Error(errorData.detail || errorData.message || "Failed to submit proposal");
      }

      const data = await response.json();
      console.log("Proposal submitted successfully:", data);
      
      setProposalSuccess(true);
      setProposalBudget("");
      setCoverLetter("");

      // Reset success message after 3 seconds
      setTimeout(() => {
        setProposalSuccess(false);
      }, 3000);

    } catch (err) {
      console.error("Error submitting proposal:", err);
      setProposalError(err.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format budget helper
  const formatBudget = (budget) => {
    if (!budget) return "0";
    return parseFloat(budget).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate time ago
  const timeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  // Extract skills from category
  const getSkills = () => {
    if (!projectData?.category) return [];
    // Split by common separators and filter empty strings
    return projectData.category
      .split(/[,;&|]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  // Loading state
  if (loading) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading project details...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Error Loading Project</h4>
                <p>{error}</p>
                <hr />
                <button
                  className="btn btn-danger"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No project found
  if (!projectData) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="alert alert-warning text-center" role="alert">
                <h4>Project Not Found</h4>
                <p>The project you're looking for doesn't exist or has been removed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const skills = getSkills();

  return (
    <>
      <section className="pt30">
        <div className="container">
          <div className="row wrap">
            <div className="col-lg-8">
              <div className="column">
                <div className="scrollbalance-inner">
                  
                  <div className="service-about">
                    {/* Project Image */}
                    {projectData.image_url && (
                      <div className="mb-4">
                        <img 
                          src={projectData.image_url} 
                          alt={projectData.title}
                          className="w-100 rounded"
                          style={{ 
                            maxHeight: '400px', 
                            objectFit: 'cover',
                            border: '1px solid #e9ecef'
                          }}
                        />
                      </div>
                    )}

                    {/* Project Info Cards */}
                    <div className="row mb-4">
                      <div className="col-md-3 col-6 mb-3">
                        <div className="iconbox-style1 contact-style d-flex align-items-start mb-4">
                          <div className="icon flex-shrink-0">
                            <span className="flaticon-calendar text-thm2 fz40" />
                          </div>
                          <div className="details">
                            <h5 className="title">Posted</h5>
                            <p className="mb-0 text">{timeAgo(projectData.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="iconbox-style1 contact-style d-flex align-items-start mb-4">
                          <div className="icon flex-shrink-0">
                            <span className="flaticon-goal text-thm2 fz40" />
                          </div>
                          <div className="details">
                            <h5 className="title">Deadline</h5>
                            <p className="mb-0 text">{formatDate(projectData.deadline)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="iconbox-style1 contact-style d-flex align-items-start mb-4">
                          <div className="icon flex-shrink-0">
                            <span className="flaticon-contract text-thm2 fz40" />
                          </div>
                          <div className="details">
                            <h5 className="title">Type</h5>
                            <p className="mb-0 text text-capitalize">
                              {projectData.project_type?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 col-6 mb-3">
                        <div className="iconbox-style1 contact-style d-flex align-items-start mb-4">
                          <div className="icon flex-shrink-0">
                            <span className="flaticon-badge text-thm2 fz40" />
                          </div>
                          <div className="details">
                            <h5 className="title">Status</h5>
                            <p className="mb-0 text">
                              <span className={`badge ${
                                projectData.status === 'open' ? 'bg-success' : 
                                projectData.status === 'in_progress' ? 'bg-warning' : 
                                projectData.status === 'completed' ? 'bg-primary' : 
                                'bg-secondary'
                              }`}>
                                {projectData.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <h4 className="mb-3">Description</h4>
                    <div 
                      className="text mb30"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {projectData.description}
                    </div>

                    <hr className="opacity-100 mb60 mt60" />

                    {/* Project Details */}
                    <h4 className="mb30">Project Details</h4>
                    <div className="row mb-4">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <span className="fw-bold me-2">Category:</span>
                          <span>{projectData.category}</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <span className="fw-bold me-2">Visibility:</span>
                          <span className="text-capitalize">{projectData.visibility}</span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <span className="fw-bold me-2">Client:</span>
                          <span>
                            {projectData.user?.first_name && projectData.user?.last_name 
                              ? `${projectData.user.first_name} ${projectData.user.last_name}`
                              : projectData.user?.username || 'Anonymous'}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <span className="fw-bold me-2">Last Updated:</span>
                          <span>{timeAgo(projectData.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="opacity-100 mb60 mt30" />

                    {/* Skills Required */}
                    {skills.length > 0 && (
                      <>
                        <h4 className="mb30">Skills Required</h4>
                        <div className="mb60">
                          {skills.map((skill, i) => (
                            <span
                              key={i}
                              className="tag list-inline-item mb-2 mb-xl-0 mr10"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <hr className="opacity-100 mb60" />
                      </>
                    )}

                    {/* Send Your Proposal */}
                    {projectData.status === 'open' && (
                      <div className="bsp_reveiw_wrt mt25">
                        <h4>Send Your Proposal</h4>

                        {/* Success Message */}
                        {proposalSuccess && (
                          <div className="alert alert-success mt-3" role="alert">
                            <strong>Success!</strong> Your proposal has been submitted successfully!
                          </div>
                        )}

                        {/* Error Message */}
                        {proposalError && (
                          <div className="alert alert-danger mt-3" role="alert">
                            <strong>Error:</strong> {proposalError}
                          </div>
                        )}

                        <form className="comments_form mt30 mb30-md" onSubmit={handleSubmitProposal}>
                          <div className="row">
                            <div className="col-md-12">
                              <div className="mb20">
                                <label className="fw500 ff-heading dark-color mb-2">
                                  Your Budget (USD) <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Enter your budget"
                                  min="1"
                                  step="0.01"
                                  value={proposalBudget}
                                  onChange={(e) => setProposalBudget(e.target.value)}
                                  disabled={submitting}
                                  required
                                />
                                <small className="text-muted">
                                  Project budget: ${formatBudget(projectData.budget)}
                                </small>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="mb-4">
                                <label className="fw500 fz16 ff-heading dark-color mb-2">
                                  Cover Letter <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="pt15 form-control"
                                  rows={6}
                                  placeholder="Describe why you're the best fit for this project. Include your relevant experience, approach, and what makes you unique..."
                                  value={coverLetter}
                                  onChange={(e) => setCoverLetter(e.target.value)}
                                  disabled={submitting}
                                  required
                                  maxLength={2000}
                                />
                                <small className="text-muted">
                                  {coverLetter.length}/2000 characters
                                </small>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="d-grid">
                                <button 
                                  type="submit"
                                  className="ud-btn btn-thm"
                                  disabled={submitting}
                                >
                                  {submitting ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      Submit a Proposal
                                      <i className="fal fa-arrow-right-long ms-2" />
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Project Closed Message */}
                    {projectData.status !== 'open' && (
                      <div className="alert alert-info" role="alert">
                        <strong>Notice:</strong> This project is currently {projectData.status?.replace('_', ' ')} and not accepting new proposals.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4" id="stikyContainer">
              <div className="column">
                {isMatchedScreen ? (
                  <Sticky bottomBoundary="#stikyContainer">
                    <div className="scrollbalance-inner">
                      <div className="blog-sidebar ms-lg-auto">
                        <ProjectPriceWidget1 projectData={projectData} />
                        <ProjectContactWidget1 projectData={projectData} />
                      </div>
                    </div>
                  </Sticky>
                ) : (
                  <div className="scrollbalance-inner">
                    <div className="blog-sidebar ms-lg-auto">
                      <ProjectPriceWidget1 projectData={projectData} />
                      <ProjectContactWidget1 projectData={projectData} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}