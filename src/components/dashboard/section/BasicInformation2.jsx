"use client";
import { useState, useEffect } from "react";
import SelectInput from "../option/SelectInput";
import Link from "next/link";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'freelancer' or 'job-provider'
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  // API URL - should come from environment variable in production
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://206.189.134.117:8000/api/project/projects/";

  // Check authentication and user role on component mount
  useEffect(() => {
    const checkUserAccess = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsCheckingRole(false);
        return;
      }

      setIsAuthenticated(true);
      
      try {
        console.log("Checking user role with token:", token.substring(0, 20) + "...");
        
        // First, try to fetch freelancer profile
        const freelancerResponse = await fetch(FREELANCER_API_URL, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        console.log("Freelancer API Response Status:", freelancerResponse.status);

        if (freelancerResponse.ok) {
          // User is a freelancer
          const freelancerData = await freelancerResponse.json();
          console.log("User is a FREELANCER:", freelancerData);
          setUserRole('freelancer');
          setError("Freelancers cannot create projects. Only job providers can create projects.");
          setIsCheckingRole(false);
          return;
        }

        // If 404, user is not a freelancer, try job provider
        if (freelancerResponse.status === 404) {
          console.log("Not a freelancer, checking job provider...");
          
          const jobProviderResponse = await fetch(JOB_PROVIDER_API_URL, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          console.log("Job Provider API Response Status:", jobProviderResponse.status);

          if (jobProviderResponse.ok) {
            // User is a job provider
            const jobProviderData = await jobProviderResponse.json();
            console.log("User is a JOB PROVIDER:", jobProviderData);
            setUserRole('job-provider');
            setError(null);
          } else if (jobProviderResponse.status === 404) {
            // User has neither profile
            console.log("User has no profile");
            setUserRole(null);
            setError("Profile not found. Please complete your profile setup.");
          } else if (jobProviderResponse.status === 401) {
            // Token expired or invalid
            console.log("Token expired or invalid");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
            setUserRole(null);
            setError("Session expired. Please log in again.");
          } else {
            // Other error
            const errorData = await jobProviderResponse.json().catch(() => ({}));
            console.log("Job Provider API Error:", errorData);
            setError("Unable to determine user role. Please try again.");
          }
        } else if (freelancerResponse.status === 401) {
          // Token expired or invalid
          console.log("Token expired or invalid");
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setUserRole(null);
          setError("Session expired. Please log in again.");
        } else {
          // Other error from freelancer endpoint
          const errorData = await freelancerResponse.json().catch(() => ({}));
          console.log("Freelancer API Error:", errorData);
          setError("Unable to verify user permissions. Please try again.");
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
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
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

    // Prepare data for API using FormData (required for file upload)
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.option);
    formData.append('budget', numericBudget);
    formData.append('project_type', projectType.value === "fixed_price" ? "fixed_price" : "hourly");
    formData.append('deadline', deadline);
    formData.append('visibility', visibility.value);
    
    // Add image if selected
    if (image) {
      formData.append('image', image);
    }

    try {
      console.log("Sending project data...");
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("API Error Response:", errorData);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
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
          setError("Access Denied: You don't have permission to create projects. Only job providers can create projects.");
          return;
        } else if (response.status === 400) {
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
          return;
        } else if (response.status >= 500) {
          setError("Server error. Please try again later.");
          return;
        }
        
        throw new Error(errorData.detail || errorData.message || "Failed to create project");
      }

      const data = await response.json();
      console.log("Project created successfully:", data);
      
      setSuccess(true);
      
      setTimeout(() => {
        resetForm();
        window.location.href = '/my-projects';
      }, 2000);
      
    } catch (err) {
      console.error("Error creating project:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError("Network error. Please check your internet connection and try again.");
      } else {
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
    
    const fileInput = document.getElementById('projectImage');
    if (fileInput) {
      fileInput.value = '';
    }
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
      
      <div className="col-xl-8">
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

        {isAuthenticated && userRole === 'job-provider' && (
          <div className="alert alert-success mb20 d-flex align-items-center" role="alert">
            <i className="fal fa-check-circle me-2"></i>
            <div>
              You are logged in as a <strong>Job Provider</strong>. 
              You can create and manage projects to hire freelancers.
            </div>
          </div>
        )}

        <form className="form-style1" onSubmit={handleSubmit}>
          {success && (
            <div className="alert alert-success mb20 d-flex align-items-center" role="alert">
              <i className="fal fa-check-circle fa-2x me-3"></i>
              <div>
                <h5 className="alert-heading mb-2">Success!</h5>
                <p className="mb-0">Project created successfully!</p>
                <small className="text-muted">Redirecting to your projects...</small>
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

            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">
                Project Image
              </label>
              <input
                id="projectImage"
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading || userRole === 'freelancer' || !isAuthenticated}
              />
              <small className="text-muted">Recommended: 800x600px, Max 5MB (JPG, PNG, GIF)</small>
              
              {imagePreview && (
                <div className="mt-3 position-relative" style={{ maxWidth: '300px' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="img-fluid rounded border"
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                    onClick={handleRemoveImage}
                    disabled={loading || userRole === 'freelancer' || !isAuthenticated}
                    title="Remove image"
                  >
                    <i className="fal fa-times"></i>
                  </button>
                </div>
              )}
            </div>

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
              <div className="alert alert-info">
                <small>
                  <i className="fal fa-info-circle me-2"></i>
                  <strong>Note:</strong> Fields marked with <span className="text-danger">*</span> are required.
                </small>
              </div>
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
      </div>
    </div>
  );
}