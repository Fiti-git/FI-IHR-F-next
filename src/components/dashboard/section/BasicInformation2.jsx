"use client";
import { useState } from "react";
import SelectInput from "../option/SelectInput";
import Link from "next/link";

export default function BasicInformation2() {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState({ option: "Select", value: "select" });
  const [skills, setSkills] = useState({ option: "Select", value: "select" });
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectType, setProjectType] = useState({ option: "Select", value: "select" });
  const [visibility, setVisibility] = useState({ option: "Select", value: "select" });
  const [clientInstructions, setClientInstructions] = useState("");
  const [freelancerLocation, setFreelancerLocation] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [tags, setTags] = useState("");
  const [freelancerCount, setFreelancerCount] = useState({ option: "Select", value: "select" });
  const [paymentTerms, setPaymentTerms] = useState({ option: "Select", value: "select" });
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // API URL
  const API_URL = "http://127.0.0.1:8000/api/project/projects/";

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!title || !description || category.value === "select" || !budget || !deadline) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (projectType.value === "select") {
      setError("Please select a project type");
      setLoading(false);
      return;
    }

    // Prepare data for API
    const projectData = {
      title: title,
      description: description,
      category: category.option,
      budget: budget,
      project_type: projectType.value === "fixed" ? "fixed_price" : "hourly",
      deadline: new Date(deadline).toISOString(),
      visibility: visibility.value === "select" ? "public" : visibility.value,
      status: "open"
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication token if needed
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create project");
      }

      const data = await response.json();
      console.log("Project created successfully:", data);
      
      setSuccess(true);
      
      // Reset form
      resetForm();
      
      // Optional: Redirect to project details page
      // window.location.href = `/projects/${data.id}`;
      
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message || "An error occurred while creating the project");
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory({ option: "Select", value: "select" });
    setSkills({ option: "Select", value: "select" });
    setBudget("");
    setDeadline("");
    setProjectType({ option: "Select", value: "select" });
    setVisibility({ option: "Select", value: "select" });
    setClientInstructions("");
    setFreelancerLocation("");
    setProjectDuration("");
    setTags("");
    setFreelancerCount({ option: "Select", value: "select" });
    setPaymentTerms({ option: "Select", value: "select" });
  };

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="col-xl-8">
        <form className="form-style1" onSubmit={handleSubmit}>
          {/* Success Message */}
          {success && (
            <div className="alert alert-success mb20" role="alert">
              Project created successfully!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mb20" role="alert">
              {error}
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
              />
            </div>

            {/* Description */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={6}
                placeholder="Project description, requirements, goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Category *"
                defaultSelect={category}
                handler={(option, value) => setCategory({ option, value })}
                data={[
                  { option: "Web Development", value: "web" },
                  { option: "Design", value: "design" },
                  { option: "Marketing", value: "marketing" },
                  { option: "Mobile Development", value: "mobile" },
                  { option: "Writing", value: "writing" },
                ]}
              />
            </div>

            {/* Skills Required */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Skills Required"
                defaultSelect={skills}
                handler={(option, value) => setSkills({ option, value })}
                data={[
                  { option: "React", value: "react" },
                  { option: "Photoshop", value: "photoshop" },
                  { option: "SEO", value: "seo" },
                  { option: "Django", value: "django" },
                  { option: "Node.js", value: "nodejs" },
                ]}
              />
            </div>

            {/* Budget */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">
                Budget <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="$1000 - $2000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>

            {/* Deadline / Due Date */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">
                Deadline / Due Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            {/* Project Type */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Project Type *"
                defaultSelect={projectType}
                handler={(option, value) => setProjectType({ option, value })}
                data={[
                  { option: "Fixed Price", value: "fixed" },
                  { option: "Hourly", value: "hourly" },
                ]}
              />
            </div>

            {/* Visibility */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Visibility"
                defaultSelect={visibility}
                handler={(option, value) => setVisibility({ option, value })}
                data={[
                  { option: "Public", value: "public" },
                  { option: "Private", value: "private" },
                ]}
              />
            </div>

            {/* Client Instructions */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Client Instructions</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Special notes or expectations..."
                value={clientInstructions}
                onChange={(e) => setClientInstructions(e.target.value)}
              />
            </div>

            {/* Preferred Freelancer Location */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Preferred Freelancer Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. US only"
                value={freelancerLocation}
                onChange={(e) => setFreelancerLocation(e.target.value)}
              />
            </div>

            {/* Project Duration Estimate */}
            <div className="col-sm-6 mb20">
              <label className="heading-color ff-heading fw500 mb10">Project Duration Estimate</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2 weeks"
                value={projectDuration}
                onChange={(e) => setProjectDuration(e.target.value)}
              />
            </div>

            {/* Tags / Keywords */}
            <div className="col-sm-12 mb20">
              <label className="heading-color ff-heading fw500 mb10">Tags / Keywords</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. UI, mobile app, branding"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Number of Freelancers Needed */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Freelancers Needed"
                defaultSelect={freelancerCount}
                handler={(option, value) => setFreelancerCount({ option, value })}
                data={[
                  { option: "Single Freelancer", value: "single" },
                  { option: "Team / Multiple", value: "team" },
                ]}
              />
            </div>

            {/* Payment Terms */}
            <div className="col-sm-6 mb20">
              <SelectInput
                label="Payment Terms"
                defaultSelect={paymentTerms}
                handler={(option, value) => setPaymentTerms({ option, value })}
                data={[
                  { option: "Upfront", value: "upfront" },
                  { option: "Milestone-based", value: "milestone" },
                  { option: "After delivery", value: "after" },
                ]}
              />
            </div>

            {/* Submit Button */}
            <div className="col-md-12 mt-3">
              <button
                type="submit"
                className="ud-btn btn-thm"
                disabled={loading}
              >
                {loading ? "Creating Project..." : "Create Project"}
                {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}