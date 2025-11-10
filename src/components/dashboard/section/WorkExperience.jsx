"use client";
import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import api from "@/lib/axios"; // Import the custom axios instance

// A reusable form for adding or editing a work experience entry
const ExperienceForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    job_title: "",
    company: "",
    start_year: "",
    end_year: "",
    description: "",
    ...initialData,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="bgc-white p30 bdrs4 mb30" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-sm-6">
          <div className="mb20">
            <label className="heading-color ff-heading fw500 mb10">Job Title</label>
            <input type="text" className="form-control" name="job_title" value={formData.job_title} onChange={handleChange} required />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="mb20">
            <label className="heading-color ff-heading fw500 mb10">Company</label>
            <input type="text" className="form-control" name="company" value={formData.company} onChange={handleChange} required />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="mb20">
            <label className="heading-color ff-heading fw500 mb10">Start Year</label>
            <input type="text" className="form-control" name="start_year" value={formData.start_year} onChange={handleChange} />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="mb20">
            <label className="heading-color ff-heading fw500 mb10">End Year</label>
            <input type="text" className="form-control" name="end_year" value={formData.end_year} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw500 mb10">Description</label>
            <textarea className="form-control" rows={4} name="description" value={formData.description} onChange={handleChange} />
          </div>
        </div>
        <div className="col-md-12">
          <button type="submit" className="ud-btn btn-thm me-3">Save</button>
          <button type="button" className="ud-btn btn-light-gray" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </form>
  );
};


export default function WorkExperience() {
  const [workExperience, setWorkExperience] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing work experience data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get("/api/profile/freelancer/");
        if (response.data && response.data.work_experience) {
          setWorkExperience(response.data.work_experience);
        }
      } catch (error) {
        console.error("Failed to fetch work experience data", error);
        // The axios interceptor will handle 401s, but we can catch other errors here
        setMessage("Could not load your experience data.");
      }
    };
    fetchProfileData();
  }, []);

  const handleAddNew = () => {
    setEditingIndex(null);
    setIsFormVisible(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsFormVisible(true);
  };

  const handleDelete = (index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this experience?");
    if (isConfirmed) {
      setWorkExperience(workExperience.filter((_, i) => i !== index));
    }
  };

  const handleSaveForm = (formData) => {
    let updatedExperience = [...workExperience];
    if (editingIndex !== null) {
      updatedExperience[editingIndex] = formData;
    } else {
      updatedExperience.push(formData);
    }
    setWorkExperience(updatedExperience);
    setIsFormVisible(false);
    setEditingIndex(null);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingIndex(null);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await api.put("/api/profile/freelancer/", {
        work_experience: workExperience,
      });

      setWorkExperience(response.data.work_experience);
      setMessage("Experience saved successfully!");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Failed to save experience details.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb30 d-sm-flex justify-content-between">
        <h5 className="list-title">Work & Experience</h5>
        {!isFormVisible && (
          <a className="add-more-btn text-thm" onClick={handleAddNew}>
            <i className="icon far fa-plus mr10" />
            Add Experience
          </a>
        )}
      </div>

      {message && <div className={`alert mb-3 ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

      {isFormVisible ? (
        <ExperienceForm
          initialData={editingIndex !== null ? workExperience[editingIndex] : {}}
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
        />
      ) : (
        <div className="position-relative">
          <div className="educational-quality">
            {workExperience.map((exp, index) => (
              <div key={index} className="wrapper mb40 position-relative">
                <div className="del-edit">
                  <div className="d-flex">
                    <a className="icon me-2" id={`edit-exp-${index}`} onClick={() => handleEdit(index)}>
                      <Tooltip anchorSelect={`#edit-exp-${index}`} className="ui-tooltip">Edit</Tooltip>
                      <span className="flaticon-pencil" />
                    </a>
                    <a className="icon" id={`delete-exp-${index}`} onClick={() => handleDelete(index)}>
                      <Tooltip anchorSelect={`#delete-exp-${index}`} className="ui-tooltip">Delete</Tooltip>
                      <span className="flaticon-delete" />
                    </a>
                  </div>
                </div>
                <span className="tag">{exp.start_year} - {exp.end_year}</span>
                <h5 className="mt15">{exp.job_title}</h5>
                <h6 className="text-thm">{exp.company}</h6>
                <p>{exp.description}</p>
              </div>
            ))}
            {workExperience.length === 0 && <p>No work experience added yet.</p>}
          </div>
          <div className="text-start">
            <button className="ud-btn btn-thm" onClick={handleSaveChanges} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
              <i className="fal fa-arrow-right-long ms-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}