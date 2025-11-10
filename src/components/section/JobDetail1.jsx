"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sticky from "react-stickynode";
import useScreen from "@/hook/useScreen";
import api from '@/lib/axios'; // Import the centralized Axios instance

export default function JobDetail1() {
  const params = useParams();
  const search = useSearchParams();
  const id = params?.id || search?.get("id");
  const isMatchedScreen = useScreen(1216);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState(null);
  const [isJobProvider, setIsJobProvider] = useState(false);
  // Keep access_token state to reactively trigger effects on auth changes
  const [accessToken, setAccessToken] = useState(typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError("No job id provided");
        setLoading(false);
        return;
      }
      try {
        // Use the api instance which handles headers automatically
        const response = await api.get(`/api/job-posting/${id}/`);
        setJob(response.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  // Listen for storage changes to update UI when user logs in/out in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e?.key === 'access_token') setAccessToken(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    // Sync on mount
    setAccessToken(localStorage.getItem('access_token'));
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Call check-auth whenever access_token changes to determine role flags
  useEffect(() => {
    if (!accessToken) {
      setIsJobProvider(false);
      return;
    }
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/profile/check-auth/');
        setIsJobProvider(Boolean(response.data?.is_job_provider));
      } catch (e) {
        console.error("Check-auth failed:", e);
        setIsJobProvider(false);
      }
    };
    checkAuth();
  }, [accessToken]);

  // Check job applications to see if the current freelancer already applied
  useEffect(() => {
    if (!id || !accessToken) return; // Only run if logged in

    const checkApplications = async () => {
      try {
        // Get freelancer profile ID from the profile endpoint
        const profileRes = await api.get('/api/profile/freelancer/');
        const profiles = profileRes.data;
        const freelancerProfileId = profiles?.[0]?.id;

        const candidateId = freelancerProfileId ?? Number(localStorage.getItem('user_id'));
        if (!candidateId) return;

        // Fetch all applications and check for a match
        const appsRes = await api.get('/api/job-application/');
        const appsArray = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data?.results || [];

        const found = appsArray.some(
          (app) => Number(app.job) === Number(id) && Number(app.freelancer_id) === Number(candidateId)
        );
        setApplied(found);
      } catch (e) {
        console.error('Error checking existing applications', e);
      }
    };
    checkApplications();
  }, [accessToken, id]);


  // Local modal state for application
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const openApplyModal = () => setShowApplyModal(true);
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setResumeFile(null);
    setCoverLetter("");
    setSubmitError(null);
  };

  const onResumeChange = (e) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
    setSubmitError(null);
  };

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!resumeFile) {
      setSubmitError('Please upload your resume before submitting.');
      return;
    }
    if (!coverLetter.trim()) {
      setSubmitError('Please provide a cover letter.');
      return;
    }

    setSubmitting(true);
    try {
      // Get freelancer profile ID from API.
      const profileRes = await api.get('/api/profile/freelancer/');
      const freelancerProfileId = profileRes.data?.[0]?.id;

      const userId = freelancerProfileId ?? localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found. Please log in or set up your profile.');
      }

      // Build FormData for the file upload
      const fd = new FormData();
      fd.append('resume', resumeFile);
      fd.append('job', String(id));
      fd.append('job_id', String(id));
      fd.append('freelancer_id', String(userId));
      fd.append('cover_letter', coverLetter);

      // Use the api instance to post the application
      await api.post('/api/job-application/', fd);

      setSubmitSuccess(true);
      setApplied(true);
      closeApplyModal();
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      let errorMessage = "Failed to submit application. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please log in before applying.';
      } else if (typeof errorData === 'object' && errorData !== null) {
        errorMessage = `Submission failed: ${Object.entries(errorData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join('; ')}`;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) return <div className="container mt-5">Loading job...</div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!job) return <div className="container mt-5"><div className="alert alert-info">Job not found</div></div>;

  // Helper to render possibly-multiline string as list
  const renderMultiline = (text) => {
    if (!text) return null;
    const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    if (lines.length === 1) return <p className="text mb20">{lines[0]}</p>;
    return (
      <div className="list-style1 mb30 pr30 pr0-lg">
        <ul>
          {lines.map((line, idx) => (
            <li key={idx}><i className="far fa-check text-thm3 bgc-thm3-light" /> {line}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Apply control to render in sidebar
  const applyControl = (!isJobProvider) ? (
    <>
      {!applied ? (
        <div className="d-grid mb-3">
          <button className="ud-btn btn-thm2" onClick={openApplyModal}>
            Apply For Job <i className="fal fa-arrow-right-long" />
          </button>
        </div>
      ) : (
        <div className="alert alert-primary d-flex align-items-center mb-3" role="alert">
          <i className="fal fa-lock fa-lg me-3" aria-hidden="true" />
          <div className="mb-0">Your Application is in Progress</div>
        </div>
      )}
      <div className="job-sidebar-meta mt-2">
        <ul className="list-unstyled mb-0 small">
          <li><strong>Application Deadline:</strong> {job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}</li>
          <li><strong>Expected Start Date:</strong> {job?.expected_start_date ? new Date(job.expected_start_date).toLocaleDateString() : 'N/A'}</li>
          <li><strong>Interview Mode:</strong> {job?.interview_mode || 'N/A'}</li>
          <li><strong>Salary Range:</strong> {job?.salary_from || '-'} - {job?.salary_to || '-'} {job?.currency || ''}</li>
          <li><strong>Job Type:</strong> {job?.job_type || 'N/A'}</li>
          <li><strong>Work Location:</strong> {job?.work_location || 'N/A'}</li>
        </ul>
      </div>
    </>
  ) : null;

  return (
    <>
      <section className="pt20 pb60">
        <div className="container">
          <div className="row wrap">
            <div className="col-lg-8">
              <div className="column">
                <div className="scrollbalance-inner">
                  <div className="service-about">
                    <h4 className="mb-4">Description</h4>
                    <p className="text mb20">{job.role_overview || "No description provided."}</p>

                    {job.key_responsibilities && (
                      <>
                        <h4 className="mb20">Key Responsibilities</h4>
                        {renderMultiline(job.key_responsibilities)}
                      </>
                    )}
                    {job.required_qualifications && (
                      <>
                        <h4 className="mb20">Required Qualifications</h4>
                        {renderMultiline(job.required_qualifications)}
                      </>
                    )}
                    {job.preferred_qualifications && (
                      <>
                        <h4 className="mb20">Preferred Qualifications</h4>
                        {renderMultiline(job.preferred_qualifications)}
                      </>
                    )}
                    <div className="job-single-meta">
                      <h4 className="mb20">Additional Information</h4>
                      <div className="list-style1 mb30 pr30 pr0-lg">
                        <ul>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Department:</strong> {job.department}</li>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Work Mode:</strong> {job.work_mode}</li>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Languages:</strong> {job.language_required || 'None specified'}</li>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Hiring Manager:</strong> {job.hiring_manager}</li>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Openings:</strong> {job.number_of_openings ?? 'N/A'}</li>
                        </ul>
                      </div>
                    </div>

                    {showApplyModal && (
                      <>
                        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={closeApplyModal} />
                        <div className="apply-modal" style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 1051, width: '90%', maxWidth: 700, background: '#fff', padding: 20, borderRadius: 8 }}>
                          <h4>Apply for {job.job_title}</h4>
                          <form onSubmit={handleLocalSubmit}>
                            <div className="mt-3">
                              <label className="mb-2 d-block">Upload Resume (PDF, DOCX)</label>
                              <input className="form-control" type="file" accept=".pdf,.doc,.docx" onChange={onResumeChange} required />
                            </div>
                            <div className="mt-3">
                              <label className="mb-2 d-block">Cover Letter</label>
                              <textarea className="form-control" rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} required />
                            </div>
                            {submitError && <div className="alert alert-danger mt-3">{submitError}</div>}
                            <div className="mt-3 d-flex justify-content-end">
                              <button type="button" className="btn btn-secondary me-2" onClick={closeApplyModal} disabled={submitting}>Close</button>
                              <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4" id="stikyContainer">
              <div className="column">
                <Sticky enabled={isMatchedScreen} top={100} bottomBoundary="#stikyContainer">
                  <div className="scrollbalance-inner">
                    <div className="blog-sidebar ms-lg-auto">
                      <div className="card mb20 p-3">
                        {applyControl}
                      </div>
                    </div>
                  </div>
                </Sticky>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}