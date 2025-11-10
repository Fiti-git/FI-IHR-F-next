"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Sticky from "react-stickynode";
import ProjectPriceWidget1 from "../element/ProjectPriceWidget1";
import ProjectContactWidget1 from "../element/ProjectContactWidget1";
import useScreen from "@/hook/useScreen";
import api from '@/lib/axios'; // Import the centralized Axios instance

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
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [existingProposal, setExistingProposal] = useState(null);

  // API constants are no longer needed, as the base URL is in the api instance.

  // Fetch current user profile to determine role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUserProfileLoading(false);
        return;
      }

      setUserProfileLoading(true);
      try {
        // Try to fetch freelancer profile first
        const freelancerRes = await api.get('/api/profile/freelancer/');
        console.log("✅ Detected freelancer profile:", freelancerRes.data);
        setCurrentUser(freelancerRes.data);
        setUserType('freelancer');
      } catch (freelancerError) {
        // If freelancer profile not found (e.g., 404), try job-provider
        if (freelancerError.response && (freelancerError.response.status === 404 || freelancerError.response.status === 403)) {
          try {
            const jpRes = await api.get('/api/profile/job-provider/');
            console.log("✅ Detected job-provider profile:", jpRes.data);
            setCurrentUser(jpRes.data);
            setUserType('job_provider');
          } catch (jpError) {
            console.error("Could not fetch any user profile:", jpError);
            setUserType(null);
            setCurrentUser(null);
          }
        } else {
          // A different error occurred (e.g., 500, or network error)
          console.error("Error fetching user profile:", freelancerError);
          setUserType(null);
          setCurrentUser(null);
        }
      } finally {
        setUserProfileLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // The api instance can be used even without auth for public endpoints
        const response = await api.get(`/api/project/projects/${id}/`);
        console.log("Fetched project details:", response.data);
        setProjectData(response.data);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.response?.data?.detail || err.message || "Failed to fetch project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  // Check if user already submitted a proposal for this project
  useEffect(() => {
    const checkExistingProposal = async () => {
      if (!currentUser || !projectData || userType !== 'freelancer') return;

      try {
        const currentUserId = currentUser.user?.id || currentUser.id;
        const response = await api.get(
          `/api/project/proposals/?project_id=${projectData.id}&freelancer_id=${currentUserId}`
        );
        const proposals = response.data;
        if (proposals && proposals.length > 0) {
          setExistingProposal(proposals[0]);
          console.log("User already has a proposal for this project");
        }
      } catch (err) {
        console.error("Error checking existing proposals:", err);
      }
    };

    checkExistingProposal();
  }, [currentUser, projectData, userType]);


  const isProjectOwner = () => {
    if (!currentUser || !projectData?.user) return false;
    const currentUserId = currentUser.user?.id || currentUser.id;
    return currentUserId === projectData.user.id;
  };

  const canSubmitProposal = () => (
    currentUser &&
    userType === 'freelancer' &&
    !isProjectOwner() &&
    projectData?.status === 'open' &&
    !existingProposal
  );

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setProposalError(null);
    setProposalSuccess(false);

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

      const response = await api.post('/api/project/proposals/', proposalData);

      console.log("Proposal submitted successfully:", response.data);
      setProposalSuccess(true);
      setExistingProposal(response.data);
      setProposalBudget("");
      setCoverLetter("");

      setTimeout(() => setProposalSuccess(false), 5000);

    } catch (err) {
      console.error("Error submitting proposal:", err.response);
      let errorMessage = err.response?.data?.detail || "Failed to submit proposal.";
      if (err.response?.status === 403) {
        errorMessage = err.response.data.detail || "Only freelancers can submit proposals.";
      }
      setProposalError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ... (All your helper functions and JSX remain unchanged) ...
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
    return projectData.category
      .split(/[,;&|]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  // Loading state
  if (loading || userProfileLoading) {
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
                              <span className={`badge ${projectData.status === 'open' ? 'bg-success' :
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

                    {/* PROPOSAL SUBMISSION SECTION - ONLY FOR FREELANCERS */}
                    {canSubmitProposal() && (
                      <div className="bsp_reveiw_wrt mt25">
                        <h4>Send Your Proposal</h4>

                        {/* Success Message */}
                        {proposalSuccess && (
                          <div className="alert alert-success mt-3 d-flex align-items-center" role="alert">
                            <i className="fal fa-check-circle fa-2x me-3"></i>
                            <div>
                              <h5 className="alert-heading mb-2">Success!</h5>
                              <p className="mb-0">Your proposal has been submitted successfully!</p>
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {proposalError && (
                          <div className="alert alert-danger mt-3 d-flex align-items-center" role="alert">
                            <i className="fal fa-exclamation-circle me-2"></i>
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
                                  placeholder="Describe why you're the best fit for this project..."
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

                    {/* Already Submitted Proposal Message */}
                    {userType === 'freelancer' && existingProposal && !isProjectOwner() && (
                      <div className="alert alert-info d-flex align-items-start mt-4" role="alert">
                        <i className="fal fa-info-circle fa-2x me-3 mt-1"></i>
                        <div>
                          <h5 className="alert-heading">Proposal Already Submitted</h5>
                          <p className="mb-2">
                            You have already submitted a proposal for this project.
                          </p>
                          <p className="mb-0">
                            <strong>Your Budget:</strong> ${formatBudget(existingProposal.budget)}
                            <br />
                            <strong>Status:</strong> <span className="badge bg-warning text-dark ms-2">
                              {existingProposal.status?.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Job Provider Cannot Submit Proposal */}
                    {userType === 'job_provider' && !isProjectOwner() && projectData.status === 'open' && (
                      <div className="alert alert-warning d-flex align-items-start mt-4" role="alert">
                        <i className="fal fa-exclamation-triangle fa-2x me-3 mt-1"></i>
                        <div>
                          <h5 className="alert-heading">Job Providers Cannot Submit Proposals</h5>
                          <p className="mb-0">
                            You are logged in as a <strong>Job Provider</strong>.
                            Only freelancers can submit proposals to projects.
                            <br />
                            <small className="text-muted mt-2 d-block">
                              Job providers can create and manage projects, but cannot bid on them.
                            </small>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Project Owner Message */}
                    {isProjectOwner() && projectData.status === 'open' && (
                      <div className="alert alert-primary d-flex align-items-start mt-4" role="alert">
                        <i className="fal fa-user-shield fa-2x me-3 mt-1"></i>
                        <div>
                          <h5 className="alert-heading">You Own This Project</h5>
                          <p className="mb-0">
                            This is your project. You cannot submit a proposal to your own project.
                            <br />
                            <small className="text-muted mt-2 d-block">
                              You can view and manage proposals from freelancers in your dashboard.
                            </small>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Not Logged In */}
                    {!currentUser && projectData.status === 'open' && (
                      <div className="alert alert-info d-flex align-items-start mt-4" role="alert">
                        <i className="fal fa-sign-in-alt fa-2x me-3 mt-1"></i>
                        <div>
                          <h5 className="alert-heading">Login Required</h5>
                          <p className="mb-3">
                            Please log in as a <strong>freelancer</strong> to submit a proposal for this project.
                          </p>
                          <a href="/login" className="btn btn-sm btn-primary">
                            <i className="fal fa-sign-in-alt me-2"></i>
                            Login to Submit Proposal
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Project Not Open */}
                    {projectData.status !== 'open' && (
                      <div className="alert alert-secondary d-flex align-items-start mt-4" role="alert">
                        <i className="fal fa-lock fa-2x me-3 mt-1"></i>
                        <div>
                          <h5 className="alert-heading">Project Not Accepting Proposals</h5>
                          <p className="mb-0">
                            This project is currently <strong className="text-uppercase">{projectData.status?.replace('_', ' ')}</strong> and not accepting new proposals.
                          </p>
                        </div>
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