"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const fetchJobDetails = async (jobId) => {
  try {
    let accessToken;
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem("accessToken");
    }
    
    if (!accessToken) {
      console.error('No access token found');
      return null;
    }

    const response = await fetch(`http://127.0.0.1:8000/api/job-posting/${jobId}/`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      return null;
    }

    const jobData = await response.json();
    console.log('API Response:', jobData);
    console.log('Key Responsibilities type:', typeof jobData.key_responsibilities);
    console.log('Key Responsibilities value:', jobData.key_responsibilities);
    return jobData;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
};

const fetchJobApplications = async (jobId) => {
  try {
    let accessToken;
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem('accessToken');
    }
    if (!accessToken) {
      console.error('No access token for applications');
      return { data: [], error: 'No access token' };
    }
    const res = await fetch(`http://127.0.0.1:8000/api/job-application/job/${jobId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    if (!res.ok) {
      const txt = await res.text().catch(()=>String(res.status));
      const err = `Failed to fetch applicants: ${res.status} ${txt}`;
      console.error(err);
      return { data: [], error: err };
    }
    const data = await res.json();
    // API may return { applications: [...] } or an array directly
    const arr = data && Array.isArray(data.applications) ? data.applications : data;
    return { data: Array.isArray(arr) ? arr : [], error: null };
  } catch (e) {
    console.error('Error fetching applications', e);
    return { data: [], error: String(e) };
  }
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id, 10);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showApplicants, setShowApplicants] = useState(true);
  const [showSelected, setShowSelected] = useState(true);
  const [showHired, setShowHired] = useState(true);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);
  const [ratings, setRatings] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingApplicant, setRatingApplicant] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [schedules, setSchedules] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleApplicant, setScheduleApplicant] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date_time: '', interview_mode: 'Zoom', interview_link: '', interview_notes: '' });
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [applicationUpdating, setApplicationUpdating] = useState({});
  const [applicationUpdateError, setApplicationUpdateError] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmApplicant, setConfirmApplicant] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'Accepted' or 'Rejected'
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);

  // helper to extract application_id from applicant.raw or applicant object
  const getApplicationIdFromApplicant = (applicant) => {
    if (!applicant) return null;
    if (applicant.raw) return applicant.raw.application_id || applicant.raw.id || applicant.id;
    return applicant.application_id || applicant.id || null;
  };

  // Update application (rating/status/comments) via PUT
  const updateApplication = async (applicationId, { rating, status, comments } = {}) => {
    if (!applicationId) throw new Error('Missing application id');
    setApplicationUpdating(prev => ({ ...prev, [applicationId]: true }));
    setApplicationUpdateError(prev => ({ ...prev, [applicationId]: null }));
    try {
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }
      if (!accessToken) throw new Error('No access token found');

      const body = {};
      if (rating !== undefined && rating !== null) body.rating = String(rating);
      if (status !== undefined) body.status = status;
      if (comments !== undefined) body.comments = comments;

      const res = await fetch(`http://127.0.0.1:8000/api/job-application/update/${applicationId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errText = '';
        try { errText = await res.text(); } catch (e) { errText = String(res.status); }
        throw new Error(`Failed to update application: ${res.status} ${errText}`);
      }

      const data = await res.json().catch(() => null);
      return data || body;
    } catch (err) {
      setApplicationUpdateError(prev => ({ ...prev, [applicationId]: String(err) }));
      throw err;
    } finally {
      setApplicationUpdating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Map UI labels to backend enum values expected by the API
  const INTERVIEW_MODE_MAP = {
    'Zoom': 'zoom',
    'Teams': 'teams',
    'In-person': 'in_person',
    'Phone': 'phone',
    'Other': 'other',
  };

  // Save schedule to backend API
  const handleSaveSchedule = async () => {
    // basic validation
    if (!scheduleApplicant || !scheduleApplicant.id) {
      alert('No applicant selected');
      return;
    }
    if (!scheduleData.date_time) {
      alert('Please provide date and time for the interview');
      return;
    }
    if (!scheduleData.interview_mode) {
      alert('Please select an interview mode');
      return;
    }

    // Determine application_id: prefer applicant.raw.application_id or raw.id, fallback to applicant.id
    const applicationId = scheduleApplicant.raw && (scheduleApplicant.raw.application_id || scheduleApplicant.raw.id) ?
      (scheduleApplicant.raw.application_id || scheduleApplicant.raw.id) : scheduleApplicant.id;

    const payload = {
      application_id: applicationId,
      date_time: scheduleData.date_time,
      // translate UI value to backend enum if mapping exists
      interview_mode: INTERVIEW_MODE_MAP[scheduleData.interview_mode] || scheduleData.interview_mode,
      interview_link: scheduleData.interview_link || null,
      interview_notes: scheduleData.interview_notes || null,
    };

    setScheduleSaving(true);
    setScheduleError(null);

    try {
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const res = await fetch('http://127.0.0.1:8000/api/job-interview/schedule/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to read json or text error
        let errText = '';
        try { errText = await res.text(); } catch (e) { errText = String(res.status); }
        throw new Error(`Failed to save schedule: ${res.status} ${errText}`);
      }

      const responseData = await res.json().catch(() => null);

      // Use responseData if present, otherwise the payload we sent
      const saved = responseData || payload;

      // update local UI state
      setSchedules(prev => ({ ...prev, [scheduleApplicant.id]: saved }));
      setApplicants(prev => prev.map(a => a.id === scheduleApplicant.id ? { ...a, schedule: saved } : a));

      // close modal
      setShowScheduleModal(false);
      setScheduleApplicant(null);
      setScheduleData({ date_time: '', interview_mode: 'Zoom', interview_link: '', interview_notes: '' });
    } catch (err) {
      console.error('Schedule save error', err);
      setScheduleError(String(err));
      // show a simple alert for now
      alert('Could not save schedule: ' + (err.message || String(err)));
    } finally {
      setScheduleSaving(false);
    }
  };

  // Handle confirm Accept/Reject action (called from confirm modal)
  const handleConfirmAction = async () => {
    if (!confirmApplicant || !confirmAction) return;
    setConfirmLoading(true);
    setConfirmResult(null);
    const appId = getApplicationIdFromApplicant(confirmApplicant) || confirmApplicant.id;
    try {
      await updateApplication(appId, { status: confirmAction });
      // update local state to reflect new status
      setApplicants(prev => prev.map(a => a.id === confirmApplicant.id ? { ...a, status: confirmAction } : a));
      setConfirmResult(`Applicant is ${confirmAction}`);
      // If applicant was accepted, update the job posting to closed
      if (confirmAction === 'Accepted' && job && job.id) {
        try {
          await updateJobPosting(job.id, { job_status: 'closed' });
          // update UI state: show Closed and set selected candidate
          setJob(prev => ({ ...prev, status: 'Closed', selectedCandidate: confirmApplicant.name }));
        } catch (err) {
          console.error('Could not update job status to closed', err);
          // keep UI in sync with acceptance; inform user that job update failed
          alert('Applicant accepted but failed to close job: ' + (err.message || String(err)));
        }
      }
    } catch (e) {
      console.error('Confirm action error', e);
      alert('Could not update status: ' + (e.message || String(e)));
    } finally {
      setConfirmLoading(false);
    }
  };

  // Update job posting via PUT to change job_status or other fields
  const updateJobPosting = async (jobId, updates = {}) => {
    if (!jobId) throw new Error('Missing job id');
    try {
      let accessToken;
      if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
      }
      if (!accessToken) throw new Error('No access token found');
      // Build payload using the original backend fields when available (job.raw)
      // so we only change job_status while keeping all other fields identical to backend values.
      const fromRaw = job && job.raw ? job.raw : {};
      const payload = {
        job_title: fromRaw.job_title ?? fromRaw.jobTitle ?? job?.title ?? '',
        department: fromRaw.department ?? job?.department ?? '',
        job_type: fromRaw.job_type ?? fromRaw.jobType ?? job?.jobType ?? '',
        work_location: fromRaw.work_location ?? job?.workLocation ?? '',
        work_mode: fromRaw.work_mode ?? job?.workMode ?? '',
        role_overview: fromRaw.role_overview ?? job?.roleOverview ?? '',
        key_responsibilities: fromRaw.key_responsibilities ?? job?.keyResponsibilities ?? '',
        required_qualifications: fromRaw.required_qualifications ?? job?.requiredQualifications ?? '',
        preferred_qualifications: fromRaw.preferred_qualifications ?? job?.preferredQualifications ?? '',
        // backend may use language_required or languages_required
        languages_required: fromRaw.languages_required ?? fromRaw.language_required ?? job?.languagesRequired ?? '',
        job_category: fromRaw.job_category ?? fromRaw.category ?? job?.category ?? '',
        salary_from: fromRaw.salary_from ?? job?.salaryFrom ?? '',
        salary_to: fromRaw.salary_to ?? job?.salaryTo ?? '',
        currency: fromRaw.currency ?? job?.currency ?? '',
        application_deadline: fromRaw.application_deadline ?? job?.applicationDeadline ?? null,
        application_method: fromRaw.application_method ?? job?.applicationMethod ?? '',
        interview_mode: fromRaw.interview_mode ?? job?.interviewMode ?? '',
        hiring_manager: fromRaw.hiring_manager ?? job?.hiringManager ?? '',
        number_of_openings: fromRaw.number_of_openings ?? job?.numberOfOpenings ?? job?.number_of_openings ?? 1,
        expected_start_date: fromRaw.expected_start_date ?? job?.expectedStartDate ?? null,
        screening_questions: fromRaw.screening_questions ?? job?.screeningQuestions ?? '',
        file_upload: fromRaw.file_upload ?? '',
        health_insurance: fromRaw.health_insurance ?? job?.benefits?.healthInsurance ?? false,
        remote_work: fromRaw.remote_work ?? job?.benefits?.remoteWork ?? false,
        paid_leave: fromRaw.paid_leave ?? job?.benefits?.paidLeave ?? false,
        bonus: fromRaw.bonus ?? job?.benefits?.bonus ?? false,
        // set job_status from updates if provided; otherwise keep backend/raw value or fall back
        job_status: updates.job_status ?? fromRaw.job_status ?? fromRaw.jobStatus ?? (job?.status ? String(job.status).toLowerCase() : 'open'),
      };

      // Allow callers to override or add fields explicitly
      Object.assign(payload, updates);

      // Remove empty-string fields before sending. Some backend choice fields
      // (e.g. application_method) reject empty strings as invalid choices.
      // Keep boolean false and numeric 0 values; only remove strings that are empty/whitespace.
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (typeof v === 'string' && v.trim() === '') {
          delete payload[k];
        }
      });

      // Debug: show the outgoing payload when running in browser (remove in prod)
      if (typeof window !== 'undefined' && window.console && process?.env?.NODE_ENV !== 'production') {
        console.debug('updateJobPosting payload:', payload);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/job-posting/${jobId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let txt = '';
        try { txt = await res.text(); } catch (e) { txt = String(res.status); }
        throw new Error(`Failed to update job posting: ${res.status} ${txt}`);
      }

      const data = await res.json().catch(() => null);
      return data || payload;
    } catch (err) {
      console.error('updateJobPosting error', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadJobDetails = async () => {
      const jobData = await fetchJobDetails(jobId);
      if (jobData) {
        // Transform API data to match our component's expected structure
        const transformedJob = {
          id: jobData.job_id,
          title: jobData.job_title,
          department: jobData.department,
          jobType: jobData.job_type,
          workLocation: jobData.work_location,
          workMode: jobData.work_mode,
          roleOverview: jobData.role_overview,
          keyResponsibilities: Array.isArray(jobData.key_responsibilities) ? 
            jobData.key_responsibilities : 
            jobData.key_responsibilities ? [jobData.key_responsibilities] : [],
          requiredQualifications: Array.isArray(jobData.required_qualifications) ? 
            jobData.required_qualifications : 
            jobData.required_qualifications ? [jobData.required_qualifications] : [],
          preferredQualifications: Array.isArray(jobData.preferred_qualifications) ? 
            jobData.preferred_qualifications : 
            jobData.preferred_qualifications ? [jobData.preferred_qualifications] : [],
          languagesRequired: Array.isArray(jobData.language_required) ? 
            jobData.language_required : 
            jobData.language_required ? [jobData.language_required] : [], // Note: backend uses language_required
          category: jobData.category,
          salaryFrom: jobData.salary_from, 
          salaryTo: jobData.salary_to,
          currency: jobData.currency,
          applicationDeadline: jobData.application_deadline,
          interviewMode: jobData.interview_mode,
          hiringManager: jobData.hiring_manager,
          numberOfOpenings: jobData.number_of_openings,
          expectedStartDate: jobData.expected_start_date,
          screeningQuestions: Array.isArray(jobData.screening_questions) ? 
            jobData.screening_questions : 
            jobData.screening_questions ? [jobData.screening_questions] : [],
          benefits: {
            healthInsurance: jobData.health_insurance || false,
            remoteWork: jobData.remote_work || false,
            paidLeave: jobData.paid_leave || false,
            bonus: jobData.bonus || false,
          },
          date: jobData.date_posted,
          status: jobData.job_status || "Open",
          description: jobData.role_overview || "", // Using role_overview as description
          applicants: [], // Add empty array as default for applicants since it's not in the API
          selectedCandidate: null // Add null as default for selectedCandidate
          ,
          // keep the original raw API response so we can reuse exact backend field values when PUTting
          raw: jobData
        };
        setJob(transformedJob);
        // load applicants for this job
        setApplicantsLoading(true);
        const appsRes = await fetchJobApplications(jobId);
        setApplicantsLoading(false);
        if (appsRes.error) {
          setApplicants([]);
          setApplicantsError(appsRes.error);
        } else {
          const mapped = appsRes.data.map(a => ({
            id: a.application_id || a.id || null,
            name: a.freelancer_name || a.freelancer?.name || a.applicant_name || (a.freelancer_profile?.full_name) || `Freelancer ${a.freelancer_id || ''}`,
            resume: a.resume_url || a.resume || a.file || null,
            cover_letter: a.cover_letter_url || a.cover_letter || a.coverletter || a.message || '',
            status: a.status || a.application_status || 'Applied',
            raw: a,
          }));
          setApplicants(mapped);
          setApplicantsError(null);
        }
      }
      setLoading(false);
    };

    loadJobDetails();
  }, [jobId]);

  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Loading job details...</h2>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Job not found</h2>
        <Link href="/manage-jobs" className="btn btn-primary mt-3">
          Back to Jobs
        </Link>
      </div>
    );
  }

  // Helper: render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="text-muted mt-3">
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Role Overview:</strong> {job.roleOverview}</p>
            <p><strong>Department / Team:</strong> {job.department}</p>
            <p><strong>Job Type:</strong> {job.jobType}</p>
            <p><strong>Work Location:</strong> {job.workLocation}</p>
            <p><strong>Work Mode:</strong> {job.workMode}</p>
            <p><strong>Date Posted:</strong> {job.date}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge ${job.status === "Open" ? "bg-success" : "bg-danger"}`}>
                {job.status}
              </span>
            </p>
          </div>
        );
      case "responsibilities":
        return (
          <ul className="mt-3 text-muted">
            {job.keyResponsibilities ? (
              typeof job.keyResponsibilities === 'string' ? 
                <li>{job.keyResponsibilities}</li> :
                Array.isArray(job.keyResponsibilities) ? 
                  job.keyResponsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  )) :
                  <li>No responsibilities listed</li>
            ) : (
              <li>No responsibilities listed</li>
            )}
          </ul>
        );
      case "qualifications":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Required Qualifications:</strong></p>
            <ul>
              {job.requiredQualifications ? (
                typeof job.requiredQualifications === 'string' ? 
                  <li>{job.requiredQualifications}</li> :
                  Array.isArray(job.requiredQualifications) ? 
                    job.requiredQualifications.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) :
                    <li>No required qualifications listed</li>
              ) : (
                <li>No required qualifications listed</li>
              )}
            </ul>
            <p><strong>Preferred Qualifications:</strong></p>
            <ul>
              {job.preferredQualifications ? (
                typeof job.preferredQualifications === 'string' ? 
                  <li>{job.preferredQualifications}</li> :
                  Array.isArray(job.preferredQualifications) ? 
                    job.preferredQualifications.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) :
                    <li>No preferred qualifications listed</li>
              ) : (
                <li>No preferred qualifications listed</li>
              )}
            </ul>
            <p><strong>Languages Required:</strong>{' '}
              {job.languagesRequired ? 
                (Array.isArray(job.languagesRequired) ? 
                  job.languagesRequired.join(", ") : 
                  job.languagesRequired
                ) : 
                "None specified"}
            </p>
          </div>
        );
      case "application":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Application Deadline:</strong> {job.applicationDeadline}</p>
            <p><strong>Application Method:</strong> {job.applicationMethod}</p>
            <p><strong>Interview Mode:</strong> {job.interviewMode}</p>
            <p><strong>Hiring Manager:</strong> {job.hiringManager}</p>
            <p><strong>Number of Openings:</strong> {job.numberOfOpenings}</p>
            <p><strong>Expected Start Date:</strong> {job.expectedStartDate}</p>
            <p><strong>Screening Questions:</strong></p>
            <ul>
              {job.screeningQuestions ? (
                typeof job.screeningQuestions === 'string' ? 
                  <li>{job.screeningQuestions}</li> :
                  Array.isArray(job.screeningQuestions) ? 
                    job.screeningQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    )) :
                    <li>No screening questions listed</li>
              ) : (
                <li>No screening questions listed</li>
              )}
            </ul>
          </div>
        );
      case "salaryBenefits":
        return (
          <div className="mt-3 text-muted">
            <p>
              <strong>Salary Range:</strong> {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} {job.currency}
            </p>
            <p><strong>Benefits:</strong></p>
            <ul>
              <li>Health Insurance: {job.benefits.healthInsurance ? "Yes" : "No"}</li>
              <li>Remote Work: {job.benefits.remoteWork ? "Yes" : "No"}</li>
              <li>Paid Leave: {job.benefits.paidLeave ? "Yes" : "No"}</li>
              <li>Bonus: {job.benefits.bonus ? "Yes" : "No"}</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      <div className="row pb40">
        <div className="col-lg-12">
          {/* Title Area */}
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{job.title}</h2>
              <p className="text">Manage this job listing details and applicants.</p>
            </div>

            {/* Edit Job Button */}
            <div>
              <Link
                href={`/edit-job/${job.id}`}
                className="ud-btn btn-dark default-box-shadow2"
              >
                Edit Job <i className="fal fa-edit" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Job Details */}
{/* Tabs for Job Details */}
<div className="row">
  <div className="col-xl-12">
    <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
      <h5 className="fw500 mb-0 mb-3">Job Details</h5> {/* moved inside and added mb-3 */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "responsibilities" ? "active" : ""}`}
            onClick={() => setActiveTab("responsibilities")}
          >
            Responsibilities
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "qualifications" ? "active" : ""}`}
            onClick={() => setActiveTab("qualifications")}
          >
            Qualifications
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "application" ? "active" : ""}`}
            onClick={() => setActiveTab("application")}
          >
            Application Info
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "salaryBenefits" ? "active" : ""}`}
            onClick={() => setActiveTab("salaryBenefits")}
          >
            Salary & Benefits
          </button>
        </li>
      </ul>

      <div className="tab-content p-3 border-top">
        {renderTabContent()}
      </div>
    </div>
  </div>
</div>


      {/* Applicants List */}
      <div className="row mt-4">
        <div className="col-xl-12">
          <div className="mb-4 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => setShowApplicants(!showApplicants)}
            >
              <h5 className="fw500 mb-0">Applicant List</h5>
              <span>{showApplicants ? "−" : "+"}</span>
            </div>
            {showApplicants && (
              <div className="mt-3 table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="table-style3 table at-savesearch mb-0">
                  <thead className="t-head">
                    <tr>
                      <th>Applicant Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {applicantsLoading ? (
                      <tr>
                        <td colSpan="2" className="text-center">Loading applicants...</td>
                      </tr>
                    ) : applicantsError ? (
                      <tr>
                        <td colSpan="2" className="text-danger">Error loading applicants: {applicantsError}</td>
                      </tr>
                    ) : applicants.length > 0 ? (
                      applicants.map((applicant) => (
                        <tr key={applicant.id}>
                          <td>
                            {applicant.name}
                            {ratings && ratings[applicant.id] ? (
                              <span className="badge bg-warning text-dark ms-2">Rating: {ratings[applicant.id]}/5</span>
                            ) : null}
                            {schedules && schedules[applicant.id] ? (
                              <span className="badge bg-info text-white ms-2">Scheduled</span>
                            ) : null}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              title="CV"
                              onClick={() => { if (applicant.resume) window.open(applicant.resume, '_blank'); else alert('No resume available'); }}
                            ><i className="fal fa-file-download" /></button>
                            <button
                              className="btn btn-sm btn-secondary me-2"
                              title="Rate"
                              onClick={() => {
                                setRatingApplicant(applicant);
                                setRatingValue(ratings && ratings[applicant.id] ? ratings[applicant.id] : 5);
                                setShowRatingModal(true);
                              }}
                            ><i className="fal fa-star" /></button>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              title="Schedule"
                              onClick={() => {
                                setScheduleApplicant(applicant);
                                // prefill scheduleData if applicant already has schedule
                                const existing = schedules && schedules[applicant.id] ? schedules[applicant.id] : null;
                                setScheduleData(existing ? {
                                  date_time: existing.date_time || '',
                                  interview_mode: existing.interview_mode || 'Zoom',
                                  interview_link: existing.interview_link || '',
                                  interview_notes: existing.interview_notes || '',
                                } : { date_time: '', interview_mode: 'Zoom', interview_link: '', interview_notes: '' });
                                setShowScheduleModal(true);
                              }}
                            ><i className="fal fa-calendar-alt" /></button>
                            <button
                              className="btn btn-sm btn-info me-2"
                              title="Chat"
                              onClick={() => alert(`Open chat with ${applicant.name} (UI-only)`) }
                            ><i className="fal fa-comments" /></button>
                            <button
                              className="btn btn-sm btn-success me-2"
                              title="Accept"
                              onClick={() => {
                                setConfirmApplicant(applicant);
                                setConfirmAction('Accepted');
                                setConfirmResult(null);
                                setShowConfirmModal(true);
                              }}
                            ><i className="fal fa-check" /></button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Reject"
                              onClick={() => {
                                setConfirmApplicant(applicant);
                                setConfirmAction('Rejected');
                                setConfirmResult(null);
                                setShowConfirmModal(true);
                              }}
                            ><i className="fal fa-times" /></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center">
                          No applicants yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal (UI-only) */}
      {/* Hired Person List (shows applicants with status 'Accepted') */}
      <div className="row mt-4">
        <div className="col-xl-12">
          <div className="mb-4 border rounded p-3">
            <div
              className="d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => setShowHired(!showHired)}
            >
              <h5 className="fw500 mb-0">Hired Person</h5>
              <span>{showHired ? "−" : "+"}</span>
            </div>
            {showHired && (
              <div className="mt-3 table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="table-style3 table at-savesearch mb-0">
                <thead className="t-head">
                  <tr>
                    <th>Person</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="t-body">
                  {applicantsLoading ? (
                    <tr>
                      <td colSpan="2" className="text-center">Loading hired persons...</td>
                    </tr>
                  ) : applicantsError ? (
                    <tr>
                      <td colSpan="2" className="text-danger">Error loading applicants: {applicantsError}</td>
                    </tr>
                  ) : (
                    (() => {
                      const accepted = Array.isArray(applicants) ? applicants.filter(a => (a.status || '').toLowerCase() === 'accepted') : [];
                      if (accepted.length === 0) {
                        return (
                          <tr>
                            <td colSpan="2" className="text-center">No hired persons yet.</td>
                          </tr>
                        );
                      }
                      return accepted.map((applicant) => (
                        <tr key={applicant.id}>
                          <td>
                            {applicant.name}
                            {ratings && ratings[applicant.id] ? (
                              <span className="badge bg-warning text-dark ms-2">Rating: {ratings[applicant.id]}/5</span>
                            ) : null}
                            {schedules && schedules[applicant.id] ? (
                              <span className="badge bg-info text-white ms-2">Scheduled</span>
                            ) : null}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              title="CV"
                              onClick={() => { if (applicant.resume) window.open(applicant.resume, '_blank'); else alert('No resume available'); }}
                            ><i className="fal fa-file-download" /></button>
                            <button
                              className="btn btn-sm btn-secondary me-2"
                              title="Rate"
                              onClick={() => {
                                setRatingApplicant(applicant);
                                setRatingValue(ratings && ratings[applicant.id] ? ratings[applicant.id] : 5);
                                setShowRatingModal(true);
                              }}
                            ><i className="fal fa-star" /></button>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              title="Schedule"
                              onClick={() => {
                                setScheduleApplicant(applicant);
                                const existing = schedules && schedules[applicant.id] ? schedules[applicant.id] : null;
                                setScheduleData(existing ? {
                                  date_time: existing.date_time || '',
                                  interview_mode: existing.interview_mode || 'Zoom',
                                  interview_link: existing.interview_link || '',
                                  interview_notes: existing.interview_notes || '',
                                } : { date_time: '', interview_mode: 'Zoom', interview_link: '', interview_notes: '' });
                                setShowScheduleModal(true);
                              }}
                            ><i className="fal fa-calendar-alt" /></button>
                            <button
                              className="btn btn-sm btn-info me-2"
                              title="Chat"
                              onClick={() => alert(`Open chat with ${applicant.name} (UI-only)`) }
                            ><i className="fal fa-comments" /></button>
                          </td>
                        </tr>
                      ));
                    })()
                  )}
                </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {showRatingModal && ratingApplicant && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="bg-white p-4 rounded" style={{ width: 360 }}>
              <h5 className="mb-3">Rate {ratingApplicant.name}</h5>
              <div className="mb-3 d-flex align-items-center">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn btn-sm me-2 ${ratingValue >= n ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                    onClick={() => setRatingValue(n)}
                    title={`${n} star${n>1?'s':''}`}
                  >
                    <i className="fal fa-star" /> {n}
                  </button>
                ))}
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => { setShowRatingModal(false); setRatingApplicant(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={async () => {
                  if (!ratingApplicant || !ratingApplicant.id) {
                    alert('No applicant selected');
                    return;
                  }
                  const appId = getApplicationIdFromApplicant(ratingApplicant) || ratingApplicant.id;
                  // optimistic UI
                  setRatings(prev => ({ ...prev, [ratingApplicant.id]: ratingValue }));
                  setApplicants(prev => prev.map(a => a.id === ratingApplicant.id ? { ...a, rating: ratingValue } : a));
                  try {
                    await updateApplication(appId, { rating: ratingValue });
                    setShowRatingModal(false);
                    setRatingApplicant(null);
                  } catch (e) {
                    // revert on error
                    setRatings(prev => {
                      const next = { ...prev };
                      delete next[ratingApplicant.id];
                      return next;
                    });
                    setApplicants(prev => prev.map(a => a.id === ratingApplicant.id ? ({ ...a, rating: undefined }) : a));
                    alert('Could not save rating: ' + (e.message || String(e)));
                  }
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal (UI-only) */}
      {showScheduleModal && scheduleApplicant && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="bg-white p-4 rounded" style={{ width: 520 }}>
              <h5 className="mb-3">Schedule interview for {scheduleApplicant.name}</h5>
              <div className="mb-2">
                <label className="form-label">Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={scheduleData.date_time}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, date_time: e.target.value }))}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Interview Mode *</label>
                <select
                  className="form-select"
                  value={scheduleData.interview_mode}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, interview_mode: e.target.value }))}
                >
                  <option>Zoom</option>
                  <option>Teams</option>
                  <option>In-person</option>
                  <option>Phone</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label">Interview Link (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://zoom.us/meeting/..."
                  maxLength={200}
                  value={scheduleData.interview_link}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, interview_link: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Interview Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={scheduleData.interview_notes}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, interview_notes: e.target.value }))}
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => { setShowScheduleModal(false); setScheduleApplicant(null); }}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSaveSchedule()}
                  disabled={scheduleSaving}
                >
                  {scheduleSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Accept/Reject Modal */}
      {showConfirmModal && confirmApplicant && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="bg-white p-4 rounded" style={{ width: 420 }}>
              {!confirmResult ? (
                <>
                  <h5 className="mb-3">{confirmAction} applicant</h5>
                  <p>Are you sure you want to <strong>{confirmAction.toLowerCase()}</strong> <strong>{confirmApplicant.name}</strong>?</p>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary me-2" onClick={() => { setShowConfirmModal(false); setConfirmApplicant(null); setConfirmAction(null); setConfirmResult(null); }}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleConfirmAction()} disabled={confirmLoading}>
                      {confirmLoading ? 'Saving...' : confirmAction}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h5 className="mb-3">{confirmResult}</h5>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-primary" onClick={() => { setShowConfirmModal(false); setConfirmApplicant(null); setConfirmAction(null); setConfirmResult(null); }}>OK</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Candidate list removed per request */}

    </div>
  );
}
