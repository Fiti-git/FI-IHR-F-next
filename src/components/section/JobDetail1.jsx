"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function JobDetail1() {
  const params = useParams();
  const search = useSearchParams();
  const id = params?.id || search?.get("id");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState(null);
  const [isJobProvider, setIsJobProvider] = useState(false);

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

        const res = await fetch(`http://206.189.134.117:8000/api/job-posting/${id}/`, { headers });
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

  // Determine if current user is a Job Provider to hide the Apply button
  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;

      const checkRole = async () => {
        try {
          const res = await fetch('http://206.189.134.117:8000/api/profile/job-provider/', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!res.ok) return; // if unauthorized or error, leave as false
          const data = await res.json().catch(() => null);
          const arr = Array.isArray(data) ? data : (data && data.results) ? data.results : [];
          setIsJobProvider(Array.isArray(arr) && arr.length > 0);
        } catch (e) {
          // ignore and keep default false
        }
      };
      checkRole();
    } catch (e) {
      // ignore
    }
  }, []);

  const handleApply = () => setApplied(true);
  // Local modal state for application (no APIs)
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrlInput, setResumeUrlInput] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const openApplyModal = () => setShowApplyModal(true);
  const closeApplyModal = () => {
    setShowApplyModal(false);
    setResumeFile(null);
    setResumeUrlInput("");
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
    // Require a resume file or a resume URL, and a cover letter
    if (!resumeFile && (!resumeUrlInput || String(resumeUrlInput).trim().length === 0)) {
      setSubmitError('Please upload your resume or provide a resume URL before submitting.');
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
          const pfRes = await fetch('http://206.189.134.117:8000/api/profile/freelancer/', {
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

      // Determine resume URL: upload file if provided, otherwise use supplied URL
      let resumeUrl = null;
      if (resumeFile) {
        try {
          const fd = new FormData();
          fd.append('file', resumeFile);
          const upRes = await fetch('http://206.189.134.117:8000/api/upload/', {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: fd,
          });
          if (!upRes.ok) {
            const txt = await upRes.text();
            console.error('Upload failed:', upRes.status, txt);
            setSubmitError('Resume upload failed. Please try again.');
            setSubmitting(false);
            return;
          }
          const ct = upRes.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await upRes.json();
            resumeUrl = j.url || j.file_url || j.file || j.resume_url || j.data?.url || null;
          } else {
            const txt = await upRes.text();
            console.warn('Upload returned non-json response:', txt);
          }
        } catch (e) {
          console.error('Resume upload error', e);
          setSubmitError('Resume upload failed. Please try again.');
          setSubmitting(false);
          return;
        }

        if (!resumeUrl || typeof resumeUrl !== 'string' || resumeUrl.length < 1 || resumeUrl.length > 200) {
          setSubmitError('Invalid resume URL returned from upload.');
          setSubmitting(false);
          return;
        }
      } else {
        // use provided resume URL
        resumeUrl = String(resumeUrlInput).trim();
        if (resumeUrl.length < 1 || resumeUrl.length > 200) {
          setSubmitError('Resume URL must be between 1 and 200 characters.');
          setSubmitting(false);
          return;
        }
        // basic URL validation
        try {
          new URL(resumeUrl);
        } catch (e) {
          setSubmitError('Please provide a valid resume URL (include https://).');
          setSubmitting(false);
          return;
        }
      }

      // Build payload according to API schema
      const payload = {
        job_id: Number(id),
        // Use freelancer profile id (profile.id) when available; otherwise fall back to stored user_id
        freelancer_id: Number(userId),
        resume: resumeUrl,
        cover_letter: coverLetter,
        job: Number(id),
      };

      const headers = { 'Content-Type': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://206.189.134.117:8000/api/job-application/', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setSubmitError('Unauthorized. Please login before applying.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        // try parse JSON error
        try {
          const jsonErr = await res.json();
          console.error('Submission error', jsonErr);
          // find first useful message
          const vals = Object.values(jsonErr);
          const first = Array.isArray(vals) && vals.length ? vals[0] : null;
          const msg = Array.isArray(first) && first.length ? String(first[0]) : JSON.stringify(jsonErr);
          setSubmitError(`Submission failed: ${msg}`);
        } catch (e) {
          const txt = await res.text();
          console.error('Submission failed body:', txt);
          setSubmitError(`Submission failed: ${res.status}`);
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
    if (lines.length === 1) return <p className="text mb30">{lines[0]}</p>;
    return (
      <div className="list-style1 mb60 pr50 pr0-lg">
        <ul>
          {lines.map((line, idx) => (
            <li key={idx}><i className="far fa-check text-thm3 bgc-thm3-light" /> {line}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <section className="pt10 pb90 pb30-md">
        <div className="container">
          <div className="row wow fadeInUp">
            <div className="col-lg-8 mx-auto">
              <div className="service-about">
                <h4 className="mb-4">Description</h4>
                {job.role_overview ? (
                  <p className="text mb30">{job.role_overview}</p>
                ) : (
                  <p className="text mb30">No description provided.</p>
                )}

                {job.key_responsibilities && (
                  <>
                    <h4 className="mb30">Key Responsibilities</h4>
                    {renderMultiline(job.key_responsibilities)}
                  </>
                )}

                {job.required_qualifications && (
                  <>
                    <h4 className="mb30">Required Qualifications</h4>
                    {renderMultiline(job.required_qualifications)}
                  </>
                )}

                {job.preferred_qualifications && (
                  <>
                    <h4 className="mb30">Preferred Qualifications</h4>
                    {renderMultiline(job.preferred_qualifications)}
                  </>
                )}

                <div className="job-single-meta">
                  <h4 className="mb20">Additional Information</h4>
                  <ul className="list-style-type-bullet mb40">
                    <li><strong>Department:</strong> {job.department}</li>
                    <li><strong>Job Type:</strong> {job.job_type}</li>
                    <li><strong>Work Location:</strong> {job.work_location}</li>
                    <li><strong>Work Mode:</strong> {job.work_mode}</li>
                    <li><strong>Languages Required:</strong> {job.language_required || job.languages_required || 'None specified'}</li>
                    <li><strong>Salary Range:</strong> {job.salary_from || '-'} - {job.salary_to || '-'} {job.currency || ''}</li>
                    <li><strong>Application Deadline:</strong> {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}</li>
                    <li><strong>Interview Mode:</strong> {job.interview_mode}</li>
                    <li><strong>Hiring Manager:</strong> {job.hiring_manager}</li>
                    <li><strong>Number of Openings:</strong> {job.number_of_openings ?? 'N/A'}</li>
                    <li><strong>Expected Start Date:</strong> {job.expected_start_date ? new Date(job.expected_start_date).toLocaleDateString() : 'N/A'}</li>
                  </ul>
                </div>

                <div className="d-grid mb60">
                  {!isJobProvider && (
                    !applied ? (
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
                    ) : (
                      <div className="success-message">Successfully Applied</div>
                    )
                  )}
                </div>

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
                        <div style={{marginTop:8}}>
                          <label className="mb-2 d-block">Or paste resume URL</label>
                          <input
                            type="url"
                            className="form-control"
                            placeholder="https://example.com/myresume.pdf"
                            value={resumeUrlInput}
                            onChange={(e) => setResumeUrlInput(e.target.value)}
                          />
                          <small className="form-text text-muted">You can either upload a file or provide a public URL to your resume. If both are provided, uploaded file takes precedence.</small>
                        </div>
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
      </section>
    </>
  );
}
