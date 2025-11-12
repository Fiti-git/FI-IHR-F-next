"use client";
import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import api from '@/lib/axios';

// A single form component for adding or editing an entry
const EducationForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    degree: "",
    school: "",
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
            <label className="heading-color ff-heading fw500 mb10">Degree</label>
            <input type="text" className="form-control" name="degree" value={formData.degree} onChange={handleChange} required />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="mb20">
            <label className="heading-color ff-heading fw500 mb10">School or University</label>
            <input type="text" className="form-control" name="school" value={formData.school} onChange={handleChange} required />
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


export default function Education() {
  const [education, setEducation] = useState([]);
  const [initialEducation, setInitialEducation] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) return;

      try {
        const response = await api.get("/api/profile/freelancer/");
        if (response.data.education) {
          setEducation(response.data.education);
          setInitialEducation(response.data.education);
        }
      } catch (error) {
        console.error("Failed to fetch education data", error);
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
    const isConfirmed = window.confirm("Are you sure you want to delete this entry?");
    if (isConfirmed) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const handleSaveForm = (formData) => {
    let updatedEducation = [...education];
    if (editingIndex !== null) {
      // Editing existing entry
      updatedEducation[editingIndex] = formData;
    } else {
      // Adding new entry
      updatedEducation.push(formData);
    }
    setEducation(updatedEducation);
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
      const res = await api.put("/api/profile/freelancer/", { education: education });
      setEducation(res.data.education);
      setInitialEducation(res.data.education);
      setMessage("Education saved successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to save education details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <div className="bdrb1 pb15 mb30 d-sm-flex justify-content-between">
        <h5 className="list-title">Education</h5>
        {!isFormVisible && (
          <a className="add-more-btn text-thm" onClick={handleAddNew}>
            <i className="icon far fa-plus mr10" />
            Add Education
          </a>
        )}
      </div>

      {message && <div className={`alert mb-3 ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

      {isFormVisible ? (
        <EducationForm
          initialData={editingIndex !== null ? education[editingIndex] : {}}
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
        />
      ) : (
        <div className="position-relative">
          <div className="educational-quality">
            {education.map((edu, index) => (
              <div key={index} className="wrapper mb40 position-relative">
                {/* This unique ID is necessary for Tooltip to work correctly on multiple items */}
                <div className="del-edit">
                  <div className="d-flex">
                    <a className="icon me-2" id={`edit-${index}`} onClick={() => handleEdit(index)}>
                      <Tooltip anchorSelect={`#edit-${index}`} className="ui-tooltip">Edit</Tooltip>
                      <span className="flaticon-pencil" />
                    </a>
                    <a className="icon" id={`delete-${index}`} onClick={() => handleDelete(index)}>
                      <Tooltip anchorSelect={`#delete-${index}`} className="ui-tooltip">Delete</Tooltip>
                      <span className="flaticon-delete" />
                    </a>
                  </div>
                </div>
                <span className="tag">{edu.start_year} - {edu.end_year}</span>
                <h5 className="mt15">{edu.degree}</h5>
                <h6 className="text-thm">{edu.school}</h6>
                <p>{edu.description}</p>
              </div>
            ))}
            {education.length === 0 && <p>No education history added yet.</p>}
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