"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SelectInput from "@/components/dashboard/option/SelectInput";
import Link from "next/link";

export default function EditProject() {
  const { id } = useParams();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState({ option: "Select", value: "select" });
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectType, setProjectType] = useState({ option: "Select", value: "select" });
  const [visibility, setVisibility] = useState({ option: "Public", value: "public" });
  const [status, setStatus] = useState({ option: "Open", value: "open" });
  
  // Image state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/project/projects/";

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    
    if (token && id) {
      fetchProjectData();
    } else {
      setLoading(false);
      setError("Please log in to edit projects");
    }
  }, [id]);

  // Fetch project data
  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}${id}/`, {
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
        } else if (response.status === 404) {
          throw new Error("Project not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched project data:", data);

      // Check if user is the owner - Simple check using username or email
      const currentUserToken = localStorage.getItem('accessToken');
      // Decode JWT to get user info (simple method)
      try {
        const base64Url = currentUserToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const tokenData = JSON.parse(jsonPayload);
        
        // Check if current user matches project owner
        if (data.user && data.user.id !== tokenData.user_id) {
          setIsOwner(false);
          throw new Error("You don't have permission to edit this project");
        }
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
      }
      
      setIsOwner(true);

      // Populate form with existing data
      setTitle(data.title || "");
      setDescription(data.description || "");
      setBudget(data.budget ? parseFloat(data.budget).toString() : "");
      
      // Set deadline - format for date input
      if (data.deadline) {
        const deadlineDate = new Date(data.deadline);
        const formattedDate = deadlineDate.toISOString().split('T')[0];
        setDeadline(formattedDate);
      }

      // Set category
      const categoryMap = {
        'Web Development': 'web_development',
        'Mobile Development': 'mobile_development',
        'Design & Creative': 'design',
        'Writing & Content': 'writing',
        'Marketing & SEO': 'marketing',
        'Data Science & Analytics': 'data_science',
        'Video & Animation': 'video',
        'Music & Audio': 'music',
      };
      
      // Find matching category
      let categoryOption = "Select";
      let categoryValue = "select";
      
      Object.entries(categoryMap).forEach(([key, value]) => {
        if (data.category === key || data.category === value) {
          categoryOption = key;
          categoryValue = value;
        }
      });

      setCategory({
        option: categoryOption,
        value: categoryValue
      });

      // Set project type
      const typeOption = data.project_type === "fixed_price" ? "Fixed Price" : "Hourly Rate";
      setProjectType({
        option: typeOption,
        value: data.project_type || "fixed_price"
      });

      // Set visibility
      const visibilityOption = data.visibility === "public" ? "Public" : "Private";
      setVisibility({
        option: visibilityOption,
        value: data.visibility || "public"
      });

      // Set status
      const statusMap = {
        'open': 'Open',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'closed': 'Closed'
      };
      setStatus({
        option: statusMap[data.status] || 'Open',
        value: data.status || 'open'
      });

      // Set existing image
      if (data.image_url) {
        setExistingImageUrl(data.image_url);
        setImagePreview(data.image_url);
      }

    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err.message || "Failed to fetch project details");
      
      if (err.message.includes("Session expired")) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

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
      setRemoveExistingImage(false);
      setError(null);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    
    // Reset file input
    const fileInput = document.getElementById('projectImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Please log in to edit projects");
      setSaving(false);
      setIsAuthenticated(false);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }

    // Validate required fields
    if (!title.trim()) {
      setError("Project title is required");
      setSaving(false);
      return;
    }

    if (!description.trim()) {
      setError("Project description is required");
      setSaving(false);
      return;
    }

    if (category.value === "select") {
      setError("Please select a category");
      setSaving(false);
      return;
    }

    if (!budget) {
      setError("Budget is required");
      setSaving(false);
      return;
    }

    if (!deadline) {
      setError("Deadline is required");
      setSaving(false);
      return;
    }

    if (projectType.value === "select") {
      setError("Please select a project type");
      setSaving(false);
      return;
    }

    // Convert budget to number
    const numericBudget = parseFloat(budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      setError("Please enter a valid budget amount greater than zero");
      setSaving(false);
      return;
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    if (isNaN(deadlineDate.getTime())) {
      setError("Please enter a valid deadline");
      setSaving(false);
      return;
    }
    
    if (deadlineDate <= now) {
      setError("Deadline must be in the future");
      setSaving(false);
      return;
    }

    // Prepare data for API using FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.option);
    formData.append('budget', numericBudget);
    formData.append('project_type', projectType.value === "fixed_price" ? "fixed_price" : "hourly");
    formData.append('deadline', deadline);
    formData.append('visibility', visibility.value);
    formData.append('status', status.value);
    
    // Handle image
    if (image) {
      formData.append('image', image);
    } else if (removeExistingImage) {
      formData.append('image', ''); // Send empty to remove image
    }

    try {
      console.log("Updating project...");
      
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PATCH", // Use PATCH for partial update
        headers: {
          "Authorization": `Bearer ${token}`
          // Do NOT set Content-Type header - browser will set it with boundary
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
            router.push('/login');
          }, 2000);
          return;
        } else if (response.status === 403) {
          setError("You don't have permission to edit this project.");
          return;
        } else if (response.status === 400) {
          // Handle validation errors
          if (errorData.budget) {
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
          } else if (errorData.status) {
            setError(`Status: ${Array.isArray(errorData.status) ? errorData.status[0] : errorData.status}`);
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
        
        throw new Error(errorData.detail || errorData.message || "Failed to update project");
      }

      const data = await response.json();
      console.log("Project updated successfully:", data);
      
      setSuccess(true);
      
      // Redirect to project details after 2 seconds
      setTimeout(() => {
        router.push(`/project-single/${id}`);
      }, 2000);
      
    } catch (err) {
      console.error("Error updating project:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An unexpected error occurred while updating the project");
      }
    } finally {
      setSaving(false);
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

  // Error state - not owner or not authenticated
  if (!isAuthenticated || !isOwner) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Access Denied</h4>
                <p>{error || "You don't have permission to edit this project"}</p>
                <hr />
                <div className="d-flex gap-2">
                  <Link href="/login" className="btn btn-danger">
                    Login
                  </Link>
                  <Link href="/manage-projects" className="btn btn-outline-secondary">
                    My Projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt30 pb90">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <div className="bdrb1 pb15 mb25">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="list-title">Edit Project</h5>
                  <Link href={`/project-single/${id}`} className="btn btn-sm btn-outline-secondary">
                    <i className="fal fa-arrow-left me-2"></i>
                    Back to Project
                  </Link>
                </div>
              </div>
              
              <div className="col-xl-8">
                <form className="form-style1" onSubmit={handleSubmit}>
                  {/* Success Message */}
                  {success && (
                    <div className="alert alert-success mb20 d-flex align-items-center" role="alert">
                      <span className="me-2">✓</span>
                      <div>
                        <strong>Success!</strong> Project updated successfully!
                        <br />
                        <small>Redirecting to project details...</small>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger mb20 d-flex align-items-center" role="alert">
                      <span className="me-2">✗</span>
                      <div>
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  )}

                  <div className="row">
                    {/* Project Title */}
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
                        disabled={saving}
                      />
                      <small className="text-muted">{title.length}/200 characters</small>
                    </div>

                    {/* Description */}
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
                        disabled={saving}
                      />
                      <small className="text-muted">{description.length}/5000 characters</small>
                    </div>

                    {/* Project Image */}
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
                        disabled={saving}
                      />
                      <small className="text-muted">Recommended: 800x600px, Max 5MB (JPG, PNG, GIF)</small>
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mt-3 position-relative" style={{ maxWidth: '300px' }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="img-fluid rounded"
                            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                            onClick={handleRemoveImage}
                            disabled={saving}
                          >
                            <i className="fal fa-times"></i>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="col-sm-6 mb20">
                      <div className={saving ? 'opacity-50' : ''}>
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

                    {/* Budget */}
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
                        disabled={saving}
                      />
                      <small className="text-muted">Enter amount in US Dollars</small>
                    </div>

                    {/* Deadline / Due Date */}
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
                        disabled={saving}
                      />
                      <small className="text-muted">Project completion date</small>
                    </div>

                    {/* Project Type */}
                    <div className="col-sm-6 mb20">
                      <div className={saving ? 'opacity-50' : ''}>
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

                    {/* Visibility */}
                    <div className="col-sm-6 mb20">
                      <div className={saving ? 'opacity-50' : ''}>
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

                    {/* Status */}
                    <div className="col-sm-6 mb20">
                      <div className={saving ? 'opacity-50' : ''}>
                        <SelectInput
                          label="Project Status"
                          defaultSelect={status}
                          handler={(option, value) => setStatus({ option, value })}
                          data={[
                            { option: "Open", value: "open" },
                            { option: "In Progress", value: "in_progress" },
                            { option: "Completed", value: "completed" },
                            { option: "Closed", value: "closed" },
                          ]}
                        />
                      </div>
                      <small className="text-muted">
                        Current project status
                      </small>
                    </div>

                    {/* Required Fields Note */}
                    <div className="col-sm-12 mb20">
                      <div className="alert alert-info">
                        <small>
                          <strong>Note:</strong> Fields marked with <span className="text-danger">*</span> are required.
                        </small>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-md-12 mt-3">
                      <div className="d-flex gap-3">
                        <button
                          type="submit"
                          className="ud-btn btn-thm"
                          disabled={saving || !isOwner}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Updating Project...
                            </>
                          ) : (
                            <>
                              <i className="fal fa-save me-2"></i>
                              Update Project
                            </>
                          )}
                        </button>
                        
                        <Link
                          href={`/project-single/${id}`}
                          className="ud-btn btn-white"
                        >
                          <i className="fal fa-times me-2"></i>
                          Cancel
                        </Link>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}