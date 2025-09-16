"use client";

import { useState } from "react";

export default function JobPostForm() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    jobType: "Full-time",
    workLocation: "",
    workMode: "On-site",
    roleOverview: "",
    keyResponsibilities: "",
    requiredQualifications: "",
    preferredQualifications: "",
    languagesRequired: "",
    jobCategory: "",
    salaryFrom: "",
    salaryTo: "",
    currency: "AED",
    healthInsurance: false,
    remoteWork: false,
    paidLeave: false,
    bonus: false,
    applicationDeadline: "",
    applicationMethod: "Portal",
    screeningQuestions: "",
    fileUpload: null,
    hiringManager: "",
    openings: "",
    expectedStartDate: "",
    interviewMode: "In-person",
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Job Post:", formData);
    // send to API or backend
  };

  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">

      <form onSubmit={handleSubmit} className="form-style1">
        <div className="row">
          <div className="col-md-6 mb20">
            <label>Job Title</label>
            <input type="text" name="jobTitle" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Department / Team</label>
            <input type="text" name="department" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Job Type</label>
            <select name="jobType" onChange={handleChange} className="form-control">
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>

          <div className="col-md-6 mb20">
            <label>Work Location</label>
            <input type="text" name="workLocation" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Work Mode</label>
            <select name="workMode" onChange={handleChange} className="form-control">
              <option>On-site</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div className="col-md-12 mb20">
            <label>Role Overview</label>
            <textarea name="roleOverview" rows={4} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Key Responsibilities</label>
            <textarea name="keyResponsibilities" rows={4} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Required Qualifications</label>
            <textarea name="requiredQualifications" rows={3} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Preferred Qualifications</label>
            <textarea name="preferredQualifications" rows={3} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Languages Required</label>
            <input type="text" name="languagesRequired" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Job Category</label>
            <input type="text" name="jobCategory" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 mb20">
            <label>Salary From</label>
            <input type="number" name="salaryFrom" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 mb20">
            <label>Salary To</label>
            <input type="number" name="salaryTo" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 mb20">
            <label>Currency</label>
            <select name="currency" onChange={handleChange} className="form-control">
              <option>AED</option>
              <option>USD</option>
            </select>
          </div>

          <div className="col-md-3 mb20">
            <label>Application Deadline</label>
            <input type="date" name="applicationDeadline" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Application Method</label>
            <select name="applicationMethod" onChange={handleChange} className="form-control">
              <option>Portal</option>
              <option>Email</option>
              <option>External Link</option>
            </select>
          </div>

          <div className="col-md-6 mb20">
            <label>Interview Mode</label>
            <select name="interviewMode" onChange={handleChange} className="form-control">
              <option>In-person</option>
              <option>Virtual</option>
              <option>Hybrid</option>
            </select>
          </div>

          <div className="col-md-6 mb20">
            <label>Hiring Manager</label>
            <input type="text" name="hiringManager" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Number of Openings</label>
            <input type="number" name="openings" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Expected Start Date</label>
            <input type="date" name="expectedStartDate" onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Screening Questions</label>
            <textarea name="screeningQuestions" rows={3} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>File Upload</label>
            <input type="file" name="fileUpload" onChange={handleChange} className="form-control" />
          </div>

          {/* Checkboxes */}
          <div className="col-md-12 mb20">
            <label className="me-3">
              <input type="checkbox" name="healthInsurance" onChange={handleChange} />
              {" "}Health Insurance
            </label>
            <label className="me-3">
              <input type="checkbox" name="remoteWork" onChange={handleChange} />
              {" "}Remote Work
            </label>
            <label className="me-3">
              <input type="checkbox" name="paidLeave" onChange={handleChange} />
              {" "}Paid Leave
            </label>
            <label className="me-3">
              <input type="checkbox" name="bonus" onChange={handleChange} />
              {" "}Bonus
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
