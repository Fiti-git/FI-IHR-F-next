"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sticky from "react-stickynode";
import useScreen from "@/hook/useScreen";

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
  const [accessToken, setAccessToken] = useState(typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("No job id provided");
        setLoading(false);
        return;
      }
      try {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const headers = { 'Content-Type': 'application/json' };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

        const res = await fetch(`http://127.0.0.1:8000/api/job-posting/${id}/`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch job (${res.status})`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Keep accessToken in state and update from localStorage (and cross-tab storage events)
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === 'accessToken') setAccessToken(e.newValue);
    };
    try {
      window.addEventListener('storage', onStorage);
    } catch (e) {
      // ignore if not supported
    }
    // pick up current value on mount
    try {
      const cur = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      setAccessToken(cur);
    } catch (e) {
      // ignore
    }
    return () => {
      try { window.removeEventListener('storage', onStorage); } catch (e) {}
    };
  }, []);

  // Call check-auth whenever accessToken changes to determine role flags
  useEffect(() => {
    if (!accessToken) {
      setIsJobProvider(false);
      return;
    }

    let cancelled = false;
    const checkAuth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profile/check-auth/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          if (!cancelled) setIsJobProvider(false);
          return;
        }
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        setIsJobProvider(Boolean(data && data.is_job_provider));
      } catch (e) {
        if (!cancelled) setIsJobProvider(false);
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, [accessToken]);

  // Check job applications to see if the current freelancer already applied to this job
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const checkApplications = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        // Try to obtain freelancer profile id first
        let freelancerProfileId = null;
        try {
          if (token) {
            const pfRes = await fetch('http://127.0.0.1:8000/api/profile/freelancer/', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            });
            if (pfRes.ok) {
              const profiles = await pfRes.json().catch(() => null);
              const arr = Array.isArray(profiles) ? profiles : (profiles && profiles.results) ? profiles.results : [];
              if (arr && arr.length > 0 && arr[0].id != null) {
                freelancerProfileId = Number(arr[0].id);
              }
            }
          }
        } catch (e) {
          console.debug('Could not fetch freelancer profile for applied-check', e);
        }

        // Fallback to localStorage user_id
        const candidateId = (freelancerProfileId != null) ? Number(freelancerProfileId) : (typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) : null);
        if (!candidateId) return;

        // Fetch all applications and check for a matching job + freelancer_id
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch('http://127.0.0.1:8000/api/job-application/', { method: 'GET', headers });
        if (!res.ok) return;
        const apps = await res.json().catch(() => null);
        const appsArray = Array.isArray(apps) ? apps : (apps && apps.results) ? apps.results : [];

        const found = appsArray.some(a => {
          try {
            return Number(a.job) === Number(id) && Number(a.freelancer_id) === Number(candidateId);
          } catch (e) {
            return false;
          }
        });

        if (!cancelled && found) setApplied(true);
      } catch (e) {
        console.error('Error checking existing applications', e);
      }
    };

    checkApplications();
    return () => { cancelled = true; };
  }, [accessToken, id]);

  const handleApply = () => setApplied(true);
  // Local modal state for application (no APIs)
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
    const file = e.target.files && e.target.files[0];
    setResumeFile(file || null);
    setSubmitError(null);
  };

  const handleLocalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Require a resume file and a cover letter
    if (!resumeFile) {
      setSubmitError('Please upload your resume before submitting.');
      return;
    }
    if (!coverLetter || String(coverLetter).trim().length < 1) {
      setSubmitError('Please provide a cover letter.');
      return;
    }

    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setSubmitError('You must be logged in to apply. Please login and try again.');
        setSubmitting(false);
        return;
      }

      // Try to get freelancer profile id from API using the access token.
      // This endpoint returns an array of freelancer profiles; use the first profile's `id` as freelancer_id.
      let freelancerProfileId = null;
      try {
        if (token) {
          const pfRes = await fetch('http://127.0.0.1:8000/api/profile/freelancer/', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });
          if (pfRes.ok) {
            const profiles = await pfRes.json().catch(() => null);
            const arr = Array.isArray(profiles) ? profiles : (profiles && profiles.results) ? profiles.results : [];
            if (arr && arr.length > 0 && arr[0].id != null) {
              freelancerProfileId = Number(arr[0].id);
            }
          } else {
            console.debug('Could not fetch freelancer profile, status:', pfRes.status);
          }
        }
      } catch (e) {
        console.error('Error fetching freelancer profile', e);
      }

      // Fallback to localStorage user_id if profile endpoint did not return an id
      const userId = (freelancerProfileId != null) ? String(freelancerProfileId) : (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
      if (!userId) {
        setSubmitError('User id not found. Please login or set your profile before applying.');
        setSubmitting(false);
        return;
      }

      // Build multipart form data with the resume file and other fields
      const fd = new FormData();
      fd.append('resume', resumeFile);
      // preserve previous keys used by backend (job and freelancer_id)
  // include both job and job_id fields because backend serializers sometimes expect one or the other
  fd.append('job', String(id));
  fd.append('job_id', String(id));
      fd.append('freelancer_id', String(userId));
      fd.append('cover_letter', coverLetter);

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const res = await fetch('http://127.0.0.1:8000/api/job-application/', {
        method: 'POST',
        headers,
        body: fd,
      });

      if (res.status === 401) {
        setSubmitError('Unauthorized. Please login before applying.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        // try parse JSON error and present clearer messages
        try {
          const jsonErr = await res.json();
          console.error('Submission error', jsonErr);
          if (jsonErr && typeof jsonErr === 'object') {
            const parts = Object.entries(jsonErr).map(([k, v]) => {
              if (Array.isArray(v)) return `${k}: ${v.join(' ')}`;
              if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
              return `${k}: ${String(v)}`;
            });
            setSubmitError(`Submission failed: ${parts.join('; ')}`);
          } else {
            setSubmitError(`Submission failed: ${JSON.stringify(jsonErr)}`);
          }
        } catch (e) {
          const txt = await res.text();
          console.error('Submission failed body:', txt);
          setSubmitError(`Submission failed: ${res.status} ${txt ? '- ' + txt : ''}`);
        }
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setSubmitting(false);
      setApplied(true);
      closeApplyModal();
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to submit application');
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

  // Apply control to render in sidebar (keeps existing logic)
  const applyControl = (!isJobProvider) ? (
    <>
      {!applied ? (
        <div className="d-grid mb-3">
          <button
            className="ud-btn btn-thm2"
            onClick={(e) => {
              e.preventDefault();
              openApplyModal();
            }}
          >
            Apply For Job
            <i className="fal fa-arrow-right-long" />
          </button>
        </div>
      ) : (
        <div className="alert alert-primary d-flex align-items-center mb-3" role="alert">
          <i className="fal fa-lock fa-lg me-3" aria-hidden="true" />
          <div className="mb-0">Your Application is in Progress</div>
        </div>
      )}

      {/* Job meta shown beneath the apply control */}
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
                    {job.role_overview ? (
                      <p className="text mb20">{job.role_overview}</p>
                    ) : (
                      <p className="text mb20">No description provided.</p>
                    )}

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
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Languages Required:</strong> {job.language_required || job.languages_required || 'None specified'}</li>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Hiring Manager:</strong> {job.hiring_manager}</li>
                          <li><i className="far fa-check text-thm3 bgc-thm3-light me-2" /> <strong>Number of Openings:</strong> {job.number_of_openings ?? 'N/A'}</li>
                        </ul>
                      </div>
                    </div>

                    {/* Apply button moved to sidebar */}

                    {showApplyModal && (
                      <>
                        <div className="modal-overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1050}} onClick={closeApplyModal} />
                        <div className="apply-modal" style={{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:1051,width:'90%',maxWidth:700,background:'#fff',padding:20,borderRadius:8}}>
                          <h4>Apply for {job.job_title || job.title || job.job_category}</h4>
                          <form onSubmit={handleLocalSubmit}>
                            <div style={{marginTop:12}}>
                              <label className="mb-2 d-block">Upload Resume (PDF, DOC)</label>
                              <input type="file" accept=".pdf,.doc,.docx" onChange={onResumeChange} />
                            </div>
                            {/* Removed resume URL input - file upload only now */}
                            <div style={{marginTop:12}}>
                              <label className="mb-2 d-block">Cover Letter</label>
                              <textarea className="form-control" rows={6} value={coverLetter} onChange={(e)=>setCoverLetter(e.target.value)} />
                            </div>
                            {submitError && <div className="alert alert-danger mt-3">{submitError}</div>}
                            <div className="mt-3 d-flex justify-content-end">
                              <button type="button" className="btn btn-secondary me-2" onClick={closeApplyModal}>Close</button>
                              <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4" id="stikyContainer">
              <div className="column">
                {isMatchedScreen ? (
                  <Sticky bottomBoundary="#stikyContainer">
                    <div className="scrollbalance-inner">
                      <div className="blog-sidebar ms-lg-auto">
                        <div className="card mb20 p-3">
                          {applyControl}
                        </div>
                        {/* Sidebar left intentionally blank for other widgets */}
                      </div>
                    </div>
                  </Sticky>
                ) : (
                  <div className="scrollbalance-inner">
                    <div className="blog-sidebar ms-lg-auto">
                      {/* Sidebar left intentionally blank to preserve job content only */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
