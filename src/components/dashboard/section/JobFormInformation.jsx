"use client";

import { useState, useEffect } from "react";

export default function JobPostForm({ initialData = null, mode = "create", jobId = null }) {
  const [formData, setFormData] = useState(() => ({
    job_title: "",
    department: "",
    job_type: "full-time",
    work_location: "",
    work_mode: "on-site",
    role_overview: "",
    key_responsibilities: "",
    required_qualifications: "",
    preferred_qualifications: "",
    languages_required: "",
    job_category: "other",
    salary_from: "",
    salary_to: "",
    currency: "USD",
    health_insurance: false,
    remote_work: false,
    paid_leave: false,
    bonus: false,
    application_deadline: "",
    application_method: "portal",
    screening_questions: "",
    file_upload: null,
    hiring_manager: "",
    number_of_openings: 1,
    expected_start_date: "",
    interview_mode: "in-person",
    job_status: "open"
  }));

  // If initialData provided (edit mode), populate form state
  useEffect(() => {
    if (!initialData) return;

    const map = {
      job_title: initialData.job_title || initialData.title || "",
      department: initialData.department || "",
      job_type: initialData.job_type || initialData.jobType || "full-time",
      work_location: initialData.work_location || initialData.location || "",
      work_mode: initialData.work_mode || "on-site",
      role_overview: initialData.role_overview || initialData.description || "",
      key_responsibilities: Array.isArray(initialData.key_responsibilities)
        ? initialData.key_responsibilities.join("\n")
        : (initialData.key_responsibilities || ""),
      required_qualifications: Array.isArray(initialData.required_qualifications)
        ? initialData.required_qualifications.join("\n")
        : (initialData.required_qualifications || ""),
      preferred_qualifications: Array.isArray(initialData.preferred_qualifications)
        ? initialData.preferred_qualifications.join("\n")
        : (initialData.preferred_qualifications || ""),
      languages_required: Array.isArray(initialData.languages_required || initialData.language_required)
        ? (initialData.languages_required || initialData.language_required).join(", ")
        : (initialData.languages_required || initialData.language_required || ""),
      job_category: initialData.job_category || initialData.category || "other",
      // If backend returns a salary_range like "10.00 - 20.00 USD", parse it
      salary_from: (() => {
        if (initialData.salary_from != null) return initialData.salary_from;
        if (initialData.salary_range) {
          const m = initialData.salary_range.match(/([0-9,.]+)\s*-\s*([0-9,.]+)/);
          if (m) return m[1];
        }
        return "";
      })(),
      salary_to: (() => {
        if (initialData.salary_to != null) return initialData.salary_to;
        if (initialData.salary_range) {
          const m = initialData.salary_range.match(/([0-9,.]+)\s*-\s*([0-9,.]+)/);
          if (m) return m[2];
        }
        return "";
      })(),
      currency: initialData.currency || initialData.currency || "USD",
      health_insurance: Boolean(initialData.health_insurance),
      remote_work: Boolean(initialData.remote_work),
      paid_leave: Boolean(initialData.paid_leave),
      bonus: Boolean(initialData.bonus),
      application_deadline: initialData.application_deadline ? formatForInput(initialData.application_deadline) : (initialData.date_posted ? formatForInput(initialData.date_posted) : ""),
      application_method: initialData.application_method || "portal",
      screening_questions: Array.isArray(initialData.screening_questions) ? initialData.screening_questions.join('\n') : (initialData.screening_questions || ""),
      file_upload: null,
      hiring_manager: initialData.hiring_manager || "",
      number_of_openings: initialData.number_of_openings ?? 1,
      expected_start_date: initialData.expected_start_date ? formatForInput(initialData.expected_start_date) : "",
      interview_mode: initialData.interview_mode || "in-person",
      job_status: initialData.job_status || "open"
    };

    setFormData(prev => ({ ...prev, ...map }));
  }, [initialData]);

  function formatForInput(dateStr) {
    try {
      // Accept ISO string and produce 'yyyy-MM-ddTHH:mm' for datetime-local
      const d = new Date(dateStr);
      if (isNaN(d)) return "";
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return "";
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format dates properly
      const applicationDeadline = formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null;
      const expectedStartDate = formData.expected_start_date ? new Date(formData.expected_start_date).toISOString() : null;

      // Prepare the data according to the backend model
      const dataToSend = {
        job_title: formData.job_title,
        department: formData.department,
        job_type: formData.job_type,
        work_location: formData.work_location,
        work_mode: formData.work_mode,
        role_overview: formData.role_overview,
        key_responsibilities: formData.key_responsibilities,
        required_qualifications: formData.required_qualifications,
        preferred_qualifications: formData.preferred_qualifications || null,
        languages_required: formData.languages_required || null,
        job_category: formData.job_category,
        salary_from: formData.salary_from ? parseFloat(formData.salary_from) : null,
        salary_to: formData.salary_to ? parseFloat(formData.salary_to) : null,
        currency: formData.currency,
        application_deadline: applicationDeadline,
        application_method: formData.application_method,
        interview_mode: formData.interview_mode,
        hiring_manager: formData.hiring_manager,
        number_of_openings: parseInt(formData.number_of_openings),
        expected_start_date: expectedStartDate,
        screening_questions: formData.screening_questions || "",
        // Note: file uploads may require multipart/form-data; keeping as null/string for now
        file_upload: null,
        health_insurance: formData.health_insurance || false,
        remote_work: formData.remote_work || false,
        paid_leave: formData.paid_leave || false,
        bonus: formData.bonus || false,
        job_status: formData.job_status || 'open'
      };

      // Detailed logging of the request
      console.log('Sending data:', {
        ...dataToSend,
        formDataKeys: Object.keys(formData),
        nullFields: Object.entries(dataToSend)
          .filter(([_, value]) => value === null)
          .map(([key]) => key)
      });
      //authentication
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const url = mode === 'edit' && jobId ? `http://127.0.0.1:8000/api/job-posting/${jobId}/` : `http://127.0.0.1:8000/api/job-posting/`;
      const method = mode === 'edit' && jobId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", responseData);
        console.log("Submitted Data:", dataToSend);
        
        // Handle different types of error responses
        if (typeof responseData === 'object') {
          // If the error contains field-specific errors
          const errorMessages = [];
          for (const [field, errors] of Object.entries(responseData)) {
            if (Array.isArray(errors)) {
              errorMessages.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              errorMessages.push(`${field}: ${errors}`);
            }
          }
          
          if (errorMessages.length > 0) {
            alert('Validation Errors:\n' + errorMessages.join('\n'));
          } else if (responseData.detail) {
            alert(`Error: ${responseData.detail}`);
          } else {
            alert(JSON.stringify(responseData, null, 2));
          }
        } else {
          alert('An unexpected error occurred. Check the console for details.');
        }
        return;
      }

      console.log('Success Response:', responseData);
  alert(mode === 'edit' ? 'Job posting updated successfully!' : 'Job posting created successfully!');
      
      // If creating, reset form; if editing, keep values
      if (mode !== 'edit') {
        setFormData({
          job_title: "",
          department: "",
          job_type: "full-time",
          work_location: "",
          work_mode: "on-site",
          role_overview: "",
          key_responsibilities: "",
          required_qualifications: "",
          preferred_qualifications: "",
          languages_required: "",
          job_category: "other",
          salary_from: "",
          salary_to: "",
          currency: "USD",
          health_insurance: false,
          remote_work: false,
          paid_leave: false,
          bonus: false,
          application_deadline: "",
          application_method: "portal",
          screening_questions: "",
          file_upload: null,
          hiring_manager: "",
          number_of_openings: 1,
          expected_start_date: "",
          interview_mode: "in-person",
          job_status: "open"
        });
      }

    } catch (error) {
      console.error("Network error:", error);
      alert('Network error occurred while creating job posting');
    }
  };


  return (
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">

      <form id="jobPostForm" onSubmit={handleSubmit} className="form-style1">
        <div className="row">
          <div className="col-md-6 mb20">
            <label>Job Title</label>
            <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Department / Team</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Job Type</label>
            <select name="job_type" value={formData.job_type} onChange={handleChange} className="form-control">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          <div className="col-md-6 mb20">
            <label>Work Location</label>
            <input type="text" name="work_location" value={formData.work_location} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Work Mode</label>
            <select name="work_mode" value={formData.work_mode} onChange={handleChange} className="form-control">
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="col-md-12 mb20">
            <label>Role Overview</label>
            <textarea name="role_overview" rows={4} value={formData.role_overview} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Key Responsibilities</label>
            <textarea name="key_responsibilities" rows={4} value={formData.key_responsibilities} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Required Qualifications</label>
            <textarea name="required_qualifications" rows={3} value={formData.required_qualifications} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>Preferred Qualifications</label>
            <textarea name="preferred_qualifications" rows={3} value={formData.preferred_qualifications} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Languages Required</label>
            <input type="text" name="languages_required" value={formData.languages_required} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Job Category</label>
            <select name="job_category" value={formData.job_category} onChange={handleChange} className="form-control">
              <option value="engineering">Engineering</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="design">Design</option>
              <option value="product">Product</option>
              <option value="customer-support">Customer Support</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-md-3 mb20">
            <label>Salary From</label>
            <input type="number" name="salary_from" value={formData.salary_from} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 mb20">
            <label>Salary To</label>
            <input type="number" name="salary_to" value={formData.salary_to} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-3 mb20">
            <label>Currency</label>
            <select name="currency" value={formData.currency} onChange={handleChange} className="form-control">
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="col-md-3 mb20">
            <label>Application Deadline</label>
            <input type="datetime-local" name="application_deadline" value={formData.application_deadline} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Application Method</label>
            <select name="application_method" value={formData.application_method} onChange={handleChange} className="form-control">
              <option value="portal">Portal</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="col-md-6 mb20">
            <label>Interview Mode</label>
            <select name="interview_mode" value={formData.interview_mode} onChange={handleChange} className="form-control">
              <option value="in-person">In-person</option>
              <option value="zoom">Zoom</option>
              <option value="phone">Phone</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="col-md-6 mb20">
            <label>Hiring Manager</label>
            <input type="text" name="hiring_manager" value={formData.hiring_manager} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Number of Openings</label>
            <input type="number" name="number_of_openings" value={formData.number_of_openings} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Expected Start Date</label>
            <input type="datetime-local" name="expected_start_date" value={formData.expected_start_date} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-6 mb20">
            <label>Job Status</label>
            <select name="job_status" value={formData.job_status} onChange={handleChange} className="form-control">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="filled">Filled</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="col-md-12 mb20">
            <label>Screening Questions</label>
            <textarea name="screening_questions" rows={3} value={formData.screening_questions} onChange={handleChange} className="form-control" />
          </div>

          <div className="col-md-12 mb20">
            <label>File Upload</label>
            <input type="file" name="file_upload" onChange={handleChange} className="form-control" />
          </div>

          {/* Checkboxes */}
          <div className="col-md-12 mb20">
            <label className="me-3">
              <input type="checkbox" name="health_insurance" checked={formData.health_insurance} onChange={handleChange} />
              {" "}Health Insurance
            </label>
            <label className="me-3">
              <input type="checkbox" name="remote_work" checked={formData.remote_work} onChange={handleChange} />
              {" "}Remote Work
            </label>
            <label className="me-3">
              <input type="checkbox" name="paid_leave" checked={formData.paid_leave} onChange={handleChange} />
              {" "}Paid Leave
            </label>
            <label className="me-3">
              <input type="checkbox" name="bonus" checked={formData.bonus} onChange={handleChange} />
              {" "}Bonus
            </label>
          </div>

        </div>
      </form>
    </div>
  );
}
