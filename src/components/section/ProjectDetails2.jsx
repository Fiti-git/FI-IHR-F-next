"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SelectInput from "@/components/dashboard/option/SelectInput";
import Link from "next/link";
import api from '@/lib/axios'; // Import the centralized Axios instance

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
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // API URL constant is no longer needed.

  // Fetch project data and check for ownership in one go.
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) {
        setLoading(false);
        setError("Project ID is missing.");
        return;
      }
      try {
        const response = await api.get(`/api/project/projects/${id}/`);
        const data = response.data;

        // If the request succeeds, the user is authenticated and is the owner.
        setHasAccess(true);

        // Populate form with existing data
        setTitle(data.title || "");
        setDescription(data.description || "");
        setBudget(data.budget ? parseFloat(data.budget).toString() : "");
        if (data.deadline) {
          setDeadline(new Date(data.deadline).toISOString().split('T')[0]);
        }
        setCategory({ option: data.category_display || "Select", value: data.category || "select" });
        setProjectType({ option: data.project_type_display || "Select", value: data.project_type || "select" });
        setVisibility({ option: data.visibility_display || "Public", value: data.visibility || "public" });
        setStatus({ option: data.status_display || 'Open', value: data.status || 'open' });
        if (data.image_url) {
          setImagePreview(data.image_url);
        }

      } catch (err) {
        setHasAccess(false);
        if (err.response) {
          if (err.response.status === 401) {
            setError("Session expired. Please log in again.");
            setTimeout(() => router.push('/login'), 2000);
          } else if (err.response.status === 403) {
            setError("You don't have permission to edit this project.");
          } else if (err.response.status === 404) {
            setError("Project not found.");
          } else {
            setError("An error occurred while fetching project details.");
          }
        } else {
          setError("Network error. Could not connect to the server.");
        }
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, router]);


  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
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
    const fileInput = document.getElementById('projectImage');
    if (fileInput) fileInput.value = '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Basic Validations
    if (!title.trim() || !description.trim() || category.value === "select" || !budget || !deadline || projectType.value === "select") {
      setError("Please fill in all required fields.");
      setSaving(false);
      return;
    }
    const numericBudget = parseFloat(budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      setError("Please enter a valid, positive budget amount.");
      setSaving(false);
      return;
    }
    if (new Date(deadline) <= new Date()) {
      setError("Deadline must be in the future.");
      setSaving(false);
      return;
    }

    // Prepare FormData for API
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.option);
    formData.append('budget', numericBudget);
    formData.append('project_type', projectType.value);
    formData.append('deadline', deadline);
    formData.append('visibility', visibility.value);
    formData.append('status', status.value);

    if (image) {
      formData.append('image', image);
    } else if (removeExistingImage) {
      formData.append('image', ''); // Send empty to signal removal
    }

    try {
      // Use PATCH for partial updates, which is what editing usually is.
      const response = await api.patch(`/api/project/projects/${id}/`, formData);
      console.log("Project updated successfully:", response.data);

      setSuccess(true);
      setTimeout(() => router.push(`/project-single/${id}`), 2000);

    } catch (err) {
      console.error("Error updating project:", err.response);
      const errorData = err.response?.data;
      let errorMessage = "Failed to update project. Please check the form and try again.";

      if (typeof errorData === 'object' && errorData !== null) {
        // Extract a more specific error message if available
        const firstErrorKey = Object.keys(errorData)[0];
        errorMessage = `${firstErrorKey}: ${Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : errorData[firstErrorKey]}`;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

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

  if (!hasAccess) {
    return (
      <section className="pt30 pb90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Access Denied</h4>
                <p>{error || "You are not authorized to view this page."}</p>
                <hr />
                <div className="d-flex gap-2">
                  <Link href="/login" className="btn btn-danger">Login</Link>
                  <Link href="/manage-projects" className="btn btn-outline-secondary">My Projects</Link>
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
                          disabled={saving}
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