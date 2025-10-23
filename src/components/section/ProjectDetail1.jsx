"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sticky from "react-stickynode";
import ProjectPriceWidget1 from "../element/ProjectPriceWidget1";
import ProjectContactWidget1 from "../element/ProjectContactWidget1";
import useScreen from "@/hook/useScreen";

export default function ProjectDetail1() {
  const isMatchedScreen = useScreen(1216);
  const params = useParams();
  const projectId = params?.id; // Get project ID from URL params

  // State management
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const [proposalError, setProposalError] = useState(null);

  // Form state for proposal
  const [budget, setBudget] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // API URLs
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project";
  const PROJECT_DETAIL_URL = `${API_URL}/projects/${projectId}/`;
  const PROPOSAL_URL = `${API_URL}/proposals/`;

  // Fetch project details
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(PROJECT_DETAIL_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch project details: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched project details:", data);
        setProject(data);
        setBudget(data.budget); // Pre-fill budget with project budget
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, PROJECT_DETAIL_URL]);

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

    // Validate form
    if (!budget || parseFloat(budget) <= 0) {
      setProposalError("Please enter a valid budget amount");
      setSubmitting(false);
      return;
    }

    if (!coverLetter.trim()) {
      setProposalError("Please write a cover letter");
      setSubmitting(false);
      return;
    }

    // Prepare proposal data
    const proposalData = {
      project: parseInt(projectId),
      budget: parseFloat(budget),
      cover_letter: coverLetter.trim(),
    };

    try {
      console.log("Submitting proposal:", proposalData);

      const response = await fetch(PROPOSAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Proposal submission error:", errorData);

        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setProposalError("Session expired. Please log in again.");
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        } else if (response.status === 400) {
          // Handle specific validation errors
          if (errorData.project) {
            setProposalError(`Project: ${Array.isArray(errorData.project) ? errorData.project[0] : errorData.project}`);
          } else if (errorData.budget) {
            setProposalError(`Budget: ${Array.isArray(errorData.budget) ? errorData.budget[0] : errorData.budget}`);
          } else if (errorData.cover_letter) {
            setProposalError(`Cover Letter: ${Array.isArray(errorData.cover_letter) ? errorData.cover_letter[0] : errorData.cover_letter}`);
          } else if (errorData.non_field_errors) {
            setProposalError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
          } else {
            setProposalError("Invalid proposal data. Please check your input.");
          }
          return;
        }

        throw new Error(errorData.detail || errorData.message || "Failed to submit proposal");
      }

      const data = await response.json();
      console.log("Proposal submitted successfully:", data);
      
      setProposalSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setBudget(project?.budget || "");
        setCoverLetter("");
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
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Extract skills from category or description
  const extractSkills = (project) => {
    if (!project) return [];
    const skills = [];
    if (project.category) {
      skills.push(project.category);
    }
    // Add more logic to extract skills from description if needed
    return skills;
  };

  // Loading state
  if (loading) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
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
          <div className="row">
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-3"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No project found
  if (!project) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center py-5">
              <p className="text-muted">Project not found.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const skills = extractSkills(project);

  return (
    <>
      <section className="pt30">
        <div className="container">
          <div className="row wrap">
            <div className="col-lg-8">
              <div className="column">
                <div className="scrollbalance-inner">
                  
                  {/* Project Header */}
                  <div className="service-about mb30">
                    <h2 className="mb20">{project.title}</h2>
                    <div className="d-flex align-items-center mb20">
                      <span className="badge bg-primary me-2">{project.category}</span>
                      <span className="badge bg-success me-2">{project.status}</span>
                      <span className="badge bg-info me-2">{project.project_type}</span>
                      <span className="badge bg-secondary">{project.visibility}</span>
                    </div>
                    <div className="mb20">
                      <p className="text-muted mb-1">
                        <i className="far fa-user me-2"></i>
                        Posted by: <strong>{project.user?.username || "Anonymous"}</strong>
                      </p>
                      <p className="text-muted mb-1">
                        <i className="far fa-calendar me-2"></i>
                        Posted on: <strong>{formatDate(project.created_at)}</strong>
                      </p>
                      <p className="text-muted mb-1">
                        <i className="far fa-clock me-2"></i>
                        Deadline: <strong>{formatDate(project.deadline)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="service-about">
                    <h4>Description</h4>
                    <p className="text mb30" style={{ whiteSpace: 'pre-wrap' }}>
                      {project.description}
                    </p>
                    
                    <hr className="opacity-100 mb60 mt60" />
                    
                    {/* Project Details */}
                    <h4 className="mb30">Project Details</h4>
                    <div className="row mb30">
                      <div className="col-md-6 mb20">
                        <div className="d-flex align-items-center">
                          <i className="far fa-money-bill-wave text-primary me-2"></i>
                          <div>
                            <small className="text-muted">Budget</small>
                            <p className="mb-0 fw-bold">${parseFloat(project.budget).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb20">
                        <div className="d-flex align-items-center">
                          <i className="far fa-briefcase text-primary me-2"></i>
                          <div>
                            <small className="text-muted">Project Type</small>
                            <p className="mb-0 fw-bold">
                              {project.project_type === 'fixed_price' ? 'Fixed Price' : 'Hourly'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb20">
                        <div className="d-flex align-items-center">
                          <i className="far fa-eye text-primary me-2"></i>
                          <div>
                            <small className="text-muted">Visibility</small>
                            <p className="mb-0 fw-bold text-capitalize">{project.visibility}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 mb20">
                        <div className="d-flex align-items-center">
                          <i className="far fa-flag text-primary me-2"></i>
                          <div>
                            <small className="text-muted">Status</small>
                            <p className="mb-0 fw-bold text-capitalize">{project.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Required */}
                    {skills.length > 0 && (
                      <>
                        <hr className="opacity-100 mb60 mt30" />
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
                      </>
                    )}

                    <hr className="opacity-100 mb60" />

                    {/* Proposal Form */}
                    <div className="bsp_reveiw_wrt mt25">
                      <h4>Send Your Proposal</h4>

                      {/* Success Message */}
                      {proposalSuccess && (
                        <div className="alert alert-success mb20 d-flex align-items-center" role="alert">
                          <span className="me-2">✓</span>
                          <div>
                            <strong>Success!</strong> Your proposal has been submitted successfully!
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {proposalError && (
                        <div className="alert alert-danger mb20 d-flex align-items-center" role="alert">
                          <span className="me-2">✗</span>
                          <div>
                            <strong>Error:</strong> {proposalError}
                          </div>
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
                                step="0.01"
                                min="1"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                required
                                disabled={submitting || project.status !== 'open'}
                              />
                              <small className="text-muted">
                                Project budget: ${parseFloat(project.budget).toFixed(2)}
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
                                rows={8}
                                placeholder="Write a compelling cover letter explaining why you're the best fit for this project. Include your relevant experience, approach to the project, and estimated timeline."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                required
                                maxLength={5000}
                                disabled={submitting || project.status !== 'open'}
                              />
                              <small className="text-muted">
                                {coverLetter.length}/5000 characters
                              </small>
                            </div>
                          </div>
                          
                          {project.status !== 'open' && (
                            <div className="col-md-12">
                              <div className="alert alert-warning mb20">
                                This project is no longer accepting proposals.
                              </div>
                            </div>
                          )}

                          <div className="col-md-12">
                            <div className="d-grid">
                              <button
                                type="submit"
                                className="ud-btn btn-thm"
                                disabled={submitting || project.status !== 'open'}
                              >
                                {submitting ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Submitting Proposal...
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
                        <ProjectPriceWidget1 project={project} />
                        <ProjectContactWidget1 project={project} />
                      </div>
                    </div>
                  </Sticky>
                ) : (
                  <div className="scrollbalance-inner">
                    <div className="blog-sidebar ms-lg-auto">
                      <ProjectPriceWidget1 project={project} />
                      <ProjectContactWidget1 project={project} />
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