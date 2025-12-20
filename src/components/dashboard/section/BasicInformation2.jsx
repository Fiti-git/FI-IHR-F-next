"use client";
import { useState, useEffect } from "react";
import SelectInput from "../option/SelectInput";
import Link from "next/link";
import api from '@/lib/axios';

export default function BasicInformation2() {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState({ option: "Select", value: "select" });
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectType, setProjectType] = useState({ option: "Select", value: "select" });
  const [visibility, setVisibility] = useState({ option: "Public", value: "public" });

  // Image state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState(null); // Store created project data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'freelancer' or 'job-provider'
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const iconResetStyle = {
  transform: 'none',
  WebkitTransform: 'none',
  MozTransform: 'none',
  msTransform: 'none',
  display: 'inline-block',
};

  const subtleBadgeStyle = (colorType) => {
  const colors = {
    success: { bg: '#e1f7ed', text: '#198754' }, // Light Green
    primary: { bg: '#e7f1ff', text: '#0d6efd' }, // Light Blue
    warning: { bg: '#fff3cd', text: '#856404' }, // Light Yellow
    secondary: { bg: '#f1f1f1', text: '#6c757d' }
  };
  const selected = colors[colorType] || colors.secondary;
  return {
    backgroundColor: selected.bg,
    color: selected.text,
    padding: '6px 14px',
    borderRadius: '10px',
    fontWeight: '500',
    display: 'inline-block',
    fontSize: '13px',
    textTransform: 'capitalize',
    border: 'none'
  };
};

  useEffect(() => {
    const checkUserAccess = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingRole(false);
        return;
      }

      setIsAuthenticated(true);

      try {
        console.log("Checking user role...");

        // First, try to fetch freelancer profile
        try {
          const freelancerResponse = await api.get('/api/profile/freelancer/');
          console.log("User is a FREELANCER:", freelancerResponse.data);
          setUserRole('freelancer');
          setError("Freelancers cannot create projects. Only job providers can create projects.");
          setIsCheckingRole(false);
          return;
        } catch (freelancerError) {
          // If 404, user is not a freelancer, continue to check job provider
          if (freelancerError.response?.status === 404) {
            console.log("Not a freelancer, checking job provider...");

            try {
              const jobProviderResponse = await api.get('/api/profile/job-provider/');
              console.log("User is a JOB PROVIDER:", jobProviderResponse.data);
              setUserRole('job-provider');
              setError(null);
            } catch (jobProviderError) {
              if (jobProviderError.response?.status === 404) {
                // User has neither profile
                console.log("User has no profile");
                setUserRole(null);
                setError("Profile not found. Please complete your profile setup.");
              } else {
                // Other error
                console.log("Job Provider API Error:", jobProviderError.response?.data);
                setError("Unable to determine user role. Please try again.");
              }
            }
          } else if (freelancerError.response?.status === 401) {
            // Token expired - axios interceptor will handle redirect
            console.log("Token expired or invalid");
            setIsAuthenticated(false);
            setUserRole(null);
            setError("Session expired. Please log in again.");
          } else {
            // Other error from freelancer endpoint
            console.log("Freelancer API Error:", freelancerError.response?.data);
            setError("Unable to verify user permissions. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setError("Network error. Unable to verify user permissions. Please check your connection and try again.");
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkUserAccess();
  }, []);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPG, PNG, GIF, WEBP)");
        return;
      }

      setImage(file);

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setError(null);
      console.log("Image selected:", {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type
      });
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('projectImage');
    if (fileInput) {
      fileInput.value = '';
    }
    console.log("Image removed");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedProject(null);

    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError("Please log in to create a project");
      setLoading(false);
      setIsAuthenticated(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Check if user is a freelancer
    if (userRole === 'freelancer') {
      setError("Access Denied: Freelancers cannot create projects. Only job providers can create projects.");
      setLoading(false);
      return;
    }

    // Check if user role is determined
    if (!userRole) {
      setError("Unable to verify user permissions. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!title.trim()) {
      setError("Project title is required");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Project description is required");
      setLoading(false);
      return;
    }

    if (category.value === "select") {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (!budget) {
      setError("Budget is required");
      setLoading(false);
      return;
    }

    if (!deadline) {
      setError("Deadline is required");
      setLoading(false);
      return;
    }

    if (projectType.value === "select") {
      setError("Please select a project type");
      setLoading(false);
      return;
    }

    // Convert budget to number
    const numericBudget = parseFloat(budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      setError("Please enter a valid budget amount greater than zero");
      setLoading(false);
      return;
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (isNaN(deadlineDate.getTime())) {
      setError("Please enter a valid deadline");
      setLoading(false);
      return;
    }

    if (deadlineDate <= now) {
      setError("Deadline must be in the future");
      setLoading(false);
      return;
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.option);
    formData.append('budget', numericBudget.toString());
    formData.append('project_type', projectType.value === "fixed_price" ? "fixed_price" : "hourly");

    // Format deadline to ISO string (Django expects datetime in ISO format)
    const formattedDeadline = new Date(deadline).toISOString();
    formData.append('deadline', formattedDeadline);

    formData.append('visibility', visibility.value);

    // Add image if selected (IMPORTANT: Must match the field name in Django model)
    if (image) {
      formData.append('image', image, image.name);
      console.log("Image attached to form:", {
        name: image.name,
        size: `${(image.size / 1024).toFixed(2)} KB`,
        type: image.type
      });
    }

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {

      const response = await api.post('/api/project/projects/', formData);

      // With axios, successful responses (2xx) are returned directly
      // Errors (4xx, 5xx) are thrown and caught in the catch block
      const data = response.data;
      console.log("Project created successfully:", data);

      // Log the image URL if available
      if (data.image_url) {
        console.log("Project image URL:", data.image_url);
      }

      setSuccess(true);
      setCreatedProject(data); // Store the created project data

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // DON'T auto-redirect - let user decide what to do next
      // User can click "View Project" or "Create Another" buttons

    } catch (err) {
      console.error("Error creating project:", err);
      
      // Handle axios errors (4xx, 5xx status codes)
      if (err.response) {
        const errorData = err.response.data;
        const status = err.response.status;

        console.log("API Error Response:", errorData);

        if (status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setError("Session expired. Please log in again.");
          setIsAuthenticated(false);
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (status === 403) {
          setError("Access Denied: You don't have permission to create projects. Only job providers can create projects.");
        } else if (status === 400) {
          // Handle validation errors
          if (errorData.user_role || errorData.role || errorData.user_type) {
            setError("Access Denied: Freelancers cannot create projects. Only job providers can create projects.");
          } else if (errorData.budget) {
            setError(`Budget: ${Array.isArray(errorData.budget) ? errorData.budget[0] : errorData.budget}`);
          } else if (errorData.deadline) {
            setError(`Deadline: ${Array.isArray(errorData.deadline) ? errorData.deadline[0] : errorData.deadline}`);
          } else if (errorData.project_type) {
            setError(`Project type: ${Array.isArray(errorData.project_type) ? errorData.project_type[0] : errorData.project_type}`);
          } else if (errorData.title) {
            setError(`Title: ${Array.isArray(errorData.title) ? errorData.title[0] : errorData.title}`);
          } else if (errorData.description) {
            setError(`Description: ${Array.isArray(errorData.description) ? errorData.description[0] : errorData.description}`);
          } else if (errorData.category) {
            setError(`Category: ${Array.isArray(errorData.category) ? errorData.category[0] : errorData.category}`);
          } else if (errorData.visibility) {
            setError(`Visibility: ${Array.isArray(errorData.visibility) ? errorData.visibility[0] : errorData.visibility}`);
          } else if (errorData.image) {
            setError(`Image: ${Array.isArray(errorData.image) ? errorData.image[0] : errorData.image}`);
          } else if (errorData.non_field_errors) {
            setError(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else {
            setError("Invalid project data. Please check your input.");
          }
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(errorData.detail || errorData.message || "Failed to create project");
        }
      } else if (err.request) {
        // Request was made but no response received (network error)
        setError("Network error. Please check your internet connection and try again.");
      } else {
        // Something else happened
        setError(err.message || "An unexpected error occurred while creating the project");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory({ option: "Select", value: "select" });
    setBudget("");
    setDeadline("");
    setProjectType({ option: "Select", value: "select" });
    setVisibility({ option: "Public", value: "public" });
    setImage(null);
    setImagePreview(null);
    setError(null);
    setSuccess(false);
    setCreatedProject(null);

    const fileInput = document.getElementById('projectImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle "Create Another Project" button
  const handleCreateAnother = () => {
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Show loading while checking user role
  if (isCheckingRole) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Create New Project</h5>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Verifying your account permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied for freelancers
  if (userRole === 'freelancer') {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Create New Project</h5>
        </div>

        <div className="col-xl-10">
          <div className="alert alert-danger d-flex align-items-start" role="alert">
            <i className="fal fa-exclamation-triangle fa-3x me-3 mt-1"></i>
            <div>
              <h4 className="alert-heading mb-3">
                <strong>Access Denied</strong>
              </h4>
              <p className="mb-2">
                <strong>Freelancers cannot create projects.</strong> This feature is only available for job providers.
              </p>
              <hr className="my-3" />
              <p className="mb-2">
                <strong>As a freelancer, you can:</strong>
              </p>
              <ul className="mb-3">
                <li className="mb-2">
                  <i className="fal fa-check-circle text-success me-2"></i>
                  Browse and search available projects
                </li>
                <li className="mb-2">
                  <i className="fal fa-check-circle text-success me-2"></i>
                  Submit proposals for projects you're interested in
                </li>
                <li className="mb-2">
                  <i className="fal fa-check-circle text-success me-2"></i>
                  Work on accepted projects and create milestones
                </li>
                <li className="mb-2">
                  <i className="fal fa-check-circle text-success me-2"></i>
                  Receive payments for completed work
                </li>
              </ul>
              <div className="mt-4 d-flex gap-3 flex-wrap">
                <Link href="/projects" className="btn btn-primary">
                  <i className="fal fa-briefcase me-2"></i>
                  Browse Projects
                </Link>
                <Link href="/my-proposals" className="btn btn-outline-primary">
                  <i className="fal fa-file-alt me-2"></i>
                  My Proposals
                </Link>
                <Link href="/dashboard" className="btn btn-outline-secondary">
                  <i className="fal fa-home me-2"></i>
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="alert alert-info mt-3" role="alert">
            <i className="fal fa-info-circle me-2"></i>
            <strong>Want to post projects?</strong> You need a job provider account to create and manage projects.
            Contact support if you'd like to upgrade your account.
          </div>
        </div>
      </div>
    );
  }

  // Show warning if role not determined
  if (!userRole && isAuthenticated) {
    return (
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 pb15 mb25">
          <h5 className="list-title">Create New Project</h5>
        </div>

        <div className="col-xl-8">
          <div className="alert alert-warning" role="alert">
            <i className="fal fa-exclamation-circle me-2"></i>
            <strong>Profile Setup Required:</strong> Unable to determine your account type.
            Please complete your profile setup before creating projects.
            <div className="mt-3">
              <Link href="/profile/setup" className="btn btn-warning">
                <i className="fal fa-user-cog me-2"></i>
                Complete Profile Setup
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb25">
        <h5 className="list-title">Create New Project</h5>
      </div>

      <div className={success ? "col-xl-12" : "col-xl-8"}>
        {!isAuthenticated && (
          <div className="alert alert-warning mb20 d-flex align-items-center" role="alert">
            <i className="fal fa-exclamation-triangle me-2"></i>
            <div>
              ⚠️ You need to be logged in to create a project.
              <Link href="/login" className="ms-2 text-decoration-underline fw-bold">
                Login here
              </Link>
            </div>
          </div>
        )}

        {/* {isAuthenticated && userRole === 'job-provider' && !success && (
          <div className="alert alert-success mb20 d-flex align-items-center" role="alert">
            <i className="fal fa-check-circle me-2"></i>
            <div>
              You are logged in as a <strong>Job Provider</strong>.
              You can create and manage projects to hire freelancers.
            </div>
          </div>
        )} */}

        {/* SUCCESS MESSAGE - Now in a col-12 for full width */}
        {success && createdProject && (
          <div className="mb30 border-0 w-100" role="alert">
            <div className="d-flex align-items-start w-100">
              <div className="flex-shrink-0">
                <i className="fal fa-check-circle fa-3x text-success me-4"></i>
              </div>
              <div className="flex-grow-1 w-100">
                <h4 className="alert-heading mb-2 text-success" style={{ fontSize: '24px' }}>
                  Project Created Successfully!
                </h4>
                <p className="mb-4 fz18 text-dark">
                  <strong>"{createdProject.title}"</strong> has been created and is now live on the platform.
                </p>

                {/* Project Details Preview - Full width background */}
                <div className="bgc-f7 p-4 rounded mb-4 w-100">
                  <div className="row g-4">
                    <div className="col-md-3">
                      <small className="text-muted d-block mb-1">Category</small>
                      <span className="fw600">{createdProject.category}</span>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted d-block mb-1">Budget</small>
                      <span className="fw600 text-success">${createdProject.budget}</span>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted d-block mb-1">Project Type</small>
                      <span className="fw600 text-capitalize">{createdProject.project_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted d-block mb-1">Status</small> 
                      <span style={subtleBadgeStyle('success')}>
                        {createdProject.status || 'Open'}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Action Buttons */}
                <div className="d-flex gap-3 flex-wrap">
                  <Link
                    href={`/project-single/${createdProject.id}`}
                    className="ud-btn btn-success"
                  >
                    <i className="fal fa-eye me-2" style={iconResetStyle}></i>
                    View Project
                  </Link>

                  <Link
                    href="/manage-projects"
                    className="ud-btn btn-success"
                  >
                    <i className="fal fa-briefcase me-2" style={iconResetStyle}></i>
                    My Projects
                  </Link>

                  <button
                    type="button"
                    className="ud-btn btn-outline-success"
                    onClick={handleCreateAnother}
                  >
                    <i className="fal fa-plus-circle me-2" style={iconResetStyle}></i>
                    Create Another Project
                  </button>

                  <Link
                    href="/dashboard"
                    className="ud-btn btn-outline-secondary"
                  >
                    <i className="fal fa-home me-2" style={iconResetStyle}></i>
                    Dashboard
                  </Link>
                </div>

                <div className="mt-4">
                  <p className="text-muted fz15">
                    <i className="fal fa-info-circle me-2 text-success"></i>
                    <strong>What's Next?</strong> Your project is now visible to freelancers.
                    You'll receive proposals soon. Check your notifications for updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb20 d-flex align-items-center" role="alert">
            <i className="fal fa-times-circle me-2"></i>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Only show form if not successful */}
        {!success && (
          <form className="form-style1" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-sm-12 mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Project Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Redesign Company Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                />
                <small className="text-muted">{title.length}/200 characters</small>
              </div>

              <div className="col-sm-12 mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Describe your project in detail: requirements, goals, deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={5000}
                  disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                />
                <small className="text-muted">{description.length}/5000 characters</small>
              </div>

              {/* <div className="col-sm-12 mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Project Image
                </label>
                <input
                  id="projectImage"
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                />
                <small className="text-muted d-block mt-1">
                  <i className="fal fa-info-circle me-1"></i>
                  Recommended: 800x600px or 16:9 ratio, Max 5MB (JPG, PNG, GIF, WEBP)
                </small>

                {imagePreview && (
                  <div className="mt-3 position-relative" style={{ maxWidth: '400px' }}>
                    <div className="border rounded overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Project preview"
                        className="img-fluid"
                        style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '300px' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      onClick={handleRemoveImage}
                      disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                      title="Remove image"
                      style={{ zIndex: 10 }}
                    >
                      <i className="fal fa-times"></i> Remove
                    </button>
                    {image && (
                      <small className="text-muted d-block mt-2">
                        <i className="fal fa-file-image me-1"></i>
                        {image.name} ({(image.size / 1024).toFixed(2)} KB)
                      </small>
                    )}
                  </div>
                )}
              </div> */}

              <div className="col-sm-6 mb20">
                <div className={loading || userRole === 'freelancer' || !isAuthenticated ? 'opacity-50' : ''}>
                  <SelectInput
                    label="Category *"
                    defaultSelect={category}
                    handler={(option, value) => setCategory({ option, value })}
                    data={[
                      { option: "Web Development", value: "web_development" },
                      { option: "Mobile Development", value: "mobile_development" },
                      { option: "Design & Creative", value: "design" },
                      { option: "Writing & Content", value: "writing" },
                      { option: "Marketing & SEO", value: "marketing" },
                      { option: "Data Science & Analytics", value: "data_science" },
                      { option: "Video & Animation", value: "video" },
                      { option: "Music & Audio", value: "music" },
                    ]}
                  />
                </div>
              </div>

              <div className="col-sm-6 mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Budget (USD) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="1000"
                  min="1"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                />
                <small className="text-muted">Enter amount in US Dollars</small>
              </div>

              <div className="col-sm-6 mb20">
                <label className="heading-color ff-heading fw500 mb10">
                  Deadline / Due Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={getTodayDate()}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                />
                <small className="text-muted">Project completion date</small>
              </div>

              <div className="col-sm-6 mb20">
                <div className={loading || userRole === 'freelancer' || !isAuthenticated ? 'opacity-50' : ''}>
                  <SelectInput
                    label="Project Type *"
                    defaultSelect={projectType}
                    handler={(option, value) => setProjectType({ option, value })}
                    data={[
                      { option: "Fixed Price", value: "fixed_price" },
                      { option: "Hourly Rate", value: "hourly" },
                    ]}
                  />
                </div>
                <small className="text-muted">
                  {projectType.value === "fixed_price"
                    ? "One-time payment for the entire project"
                    : projectType.value === "hourly"
                      ? "Pay based on hours worked"
                      : "Select how you want to pay"}
                </small>
              </div>

              <div className="col-sm-12 mb20">
                <div className={loading || userRole === 'freelancer' || !isAuthenticated ? 'opacity-50' : ''}>
                  <SelectInput
                    label="Project Visibility"
                    defaultSelect={visibility}
                    handler={(option, value) => setVisibility({ option, value })}
                    data={[
                      { option: "Public", value: "public" },
                      { option: "Private", value: "private" },
                    ]}
                  />
                </div>
                <small className="text-muted">
                  {visibility.value === "public"
                    ? "Visible to all freelancers on the platform"
                    : "Only visible to invited freelancers"}
                </small>
              </div>

              <div className="col-sm-12 mb20">
                <p className="text-muted mb-0 fz14">
                  <i className="fal fa-info-circle me-2"></i>
                  <span className="fw600 text-dark">Note:</span> Fields marked with <span className="text-danger">*</span> are required.
                  {image && " Your project image will be uploaded with the form."}
                </p>
              </div>

              <div className="col-md-12 mt-3">
                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="ud-btn btn-thm"
                    disabled={loading || !isAuthenticated || userRole === 'freelancer'}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <i className="fal fa-plus me-2"></i>
                        Create Project
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="ud-btn btn-white"
                    onClick={resetForm}
                    disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                  >
                    <i className="fal fa-redo me-2"></i>
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}