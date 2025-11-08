"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sticky from "react-stickynode";
import useScreen from "@/hook/useScreen";

// Reusable widgets (you may need to create or adapt these)
const JobPriceWidget = ({ job }) => {
  const formatBudget = (val) => (val ? parseFloat(val).toLocaleString() : "0");
  const salary = job?.salary_from || job?.salary_to
    ? `${formatBudget(job?.salary_from)} - ${formatBudget(job?.salary_to)} ${job?.currency || ''}`.trim()
    : "Negotiable";

  return (
    <div className="card mb20 p-4 border">
      <h5 className="mb-3">Salary Range</h5>
      <p className="h4 text-thm2 mb-0">{salary}</p>
      {job?.job_type && <small className="text-muted d-block mt-1">{job.job_type}</small>}
    </div>
  );
};

const JobContactWidget = ({ job }) => {
  return (
    <div className="card p-4 border">
      <h5 className="mb-3">Job Details</h5>
      <ul className="list-unstyled small">
        <li className="mb-2"><strong>Department:</strong> {job?.department || 'N/A'}</li>
        <li className="mb-2"><strong>Hiring Manager:</strong> {job?.hiring_manager || 'N/A'}</li>
        <li className="mb-2"><strong>Work Mode:</strong> {job?.work_mode || 'N/A'}</li>
        <li className="mb-2"><strong>Location:</strong> {job?.work_location || 'N/A'}</li>
        <li className="mb-2"><strong>Openings:</strong> {job?.number_of_openings ?? 'N/A'}</li>
        <li><strong>Languages:</strong> {job?.language_required || job?.languages_required || 'None'}</li>
      </ul>
    </div>
  );
};

export default function JobDetail1() {
  const isMatchedScreen = useScreen(1216);
  const { id } = useParams();

  // State
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [isJobProvider, setIsJobProvider] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const BASE_API_URL = "http://206.189.134.117:8000";

  // Fetch Job
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${BASE_API_URL}/api/job-posting/${id}/`, { headers });
        if (!res.ok) throw new Error(`Failed to fetch job (${res.status})`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Sync accessToken
  useEffect(() => {
    const onStorage = (e) => e.key === "accessToken" && setAccessToken(e.newValue);
    window.addEventListener("storage", onStorage);
    setAccessToken(localStorage.getItem("accessToken"));
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Check role
  useEffect(() => {
    if (!accessToken) {
      setIsJobProvider(false);
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/profile/check-auth/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsJobProvider(!!data.is_job_provider);
        }
      } catch (e) {
        setIsJobProvider(false);
      }
    };
    check();
  }, [accessToken]);

  // Check if already applied
  useEffect(() => {
    if (!id || !accessToken) return;

    const checkApplied = async () => {
      try {
        let freelancerId = null;
        const pfRes = await fetch(`${BASE_API_URL}/api/profile/freelancer/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (pfRes.ok) {
          const profiles = await pfRes.json();
          const arr = Array.isArray(profiles) ? profiles : profiles.results || [];
          if (arr[0]?.id) freelancerId = arr[0].id;
        }

        const userId = freelancerId || localStorage.getItem("user_id");
        if (!userId) return;

        const res = await fetch(`${BASE_API_URL}/api/job-application/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const apps = await res.json();
        const arr = Array.isArray(apps) ? apps : apps.results || [];
        const found = arr.some(a => Number(a.job) === Number(id) && Number(a.freelancer_id) === Number(userId));
        if (found) setApplied(true);
      } catch (e) {
        console.error(e);
      }
    };
    checkApplied();
  }, [id, accessToken]);

  // Apply Handler
  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!resumeFile) return setSubmitError("Resume is required");
    if (!coverLetter.trim()) return setSubmitError("Cover letter is required");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Login required");

      let freelancerId = null;
      const pfRes = await fetch(`${BASE_API_URL}/api/profile/freelancer/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pfRes.ok) {
        const profiles = await pfRes.json();
        const arr = Array.isArray(profiles) ? profiles : profiles.results || [];
        if (arr[0]?.id) freelancerId = arr[0].id;
      }

      const userId = freelancerId || localStorage.getItem("user_id");
      if (!userId) throw new Error("Profile not found");

      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("job", id);
      fd.append("job_id", id);
      fd.append("freelancer_id", userId);
      fd.append("cover_letter", coverLetter);

      const res = await fetch(`${BASE_API_URL}/api/job-application/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(Object.values(err).flat().join(" ") || "Submission failed");
      }

      setSubmitSuccess(true);
      setApplied(true);
      setTimeout(() => setShowApplyModal(false), 1500);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A";
  const timeAgo = (d) => {
    if (!d) return "Recently";
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return formatDate(d);
  };

  const renderMultiline = (text) => {
    if (!text) return null;
    return text.split(/\n/).map((line, i) => line.trim() ? <p key={i} className="mb-2">• {line.trim()}</p> : null);
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (error) return <div className="alert alert-danger text-center">{error}</div>;
  if (!job) return <div className="alert alert-warning text-center">Job not found</div>;

  return (
    <>
      <section className="pt30">
        <div className="container">
          <div className="row wrap">
            {/* Main Content */}
            <div className="col-lg-8">
              <div className="column">
                <div className="scrollbalance-inner">

                  {/* Header Info */}
                  <div className="row mb-4">
                    <div className="col-md-3 col-6 mb-3">
                      <div className="iconbox-style1 contact-style d-flex align-items-start">
                        <div className="icon flex-shrink-0"><span className="flaticon-calendar text-thm2 fz40" /></div>
                        <div className="details">
                          <h5 className="title">Posted</h5>
                          <p className="mb-0 text">{timeAgo(job.created_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="iconbox-style1 contact-style d-flex align-items-start">
                        <div className="icon flex-shrink-0"><span className="flaticon-goal text-thm2 fz40" /></div>
                        <div className="details">
                          <h5 className="title">Deadline</h5>
                          <p className="mb-0 text">{formatDate(job.application_deadline)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="iconbox-style1 contact-style d-flex align-items-start">
                        <div className="icon flex-shrink-0"><span className="flaticon-contract text-thm2 fz40" /></div>
                        <div className="details">
                          <h5 className="title">Type</h5>
                          <p className="mb-0 text text-capitalize">{job.job_type?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="iconbox-style1 contact-style d-flex align-items-start">
                        <div className="icon flex-shrink-0"><span className="flaticon-location text-thm2 fz40" /></div>
                        <div className="details">
                          <h5 className="title">Location</h5>
                          <p className="mb-0 text">{job.work_location || 'Remote'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="opacity-100 mb60" />

                  {/* Description */}
                  <h4 className="mb-3">Role Overview</h4>
                  <div className="text mb30" style={{ whiteSpace: 'pre-wrap' }}>
                    {job.role_overview || "No overview provided."}
                  </div>

                  {job.key_responsibilities && (
                    <>
                      <h4 className="mb-3">Key Responsibilities</h4>
                      <div className="mb30">{renderMultiline(job.key_responsibilities)}</div>
                    </>
                  )}

                  {job.required_qualifications && (
                    <>
                      <h4 className="mb-3">Required Qualifications</h4>
                      <div className="mb30">{renderMultiline(job.required_qualifications)}</div>
                    </>
                  )}

                  {job.preferred_qualifications && (
                    <>
                      <h4 className="mb-3">Preferred Qualifications</h4>
                      <div className="mb30">{renderMultiline(job.preferred_qualifications)}</div>
                    </>
                  )}

                  <hr className="opacity-100 mb60 mt60" />

                  {/* Apply Section */}
                  {!isJobProvider && !applied && (
                    <div className="bsp_reveiw_wrt mt25">
                      <h4>Apply for This Job</h4>
                      <button
                        className="ud-btn btn-thm mt-3"
                        onClick={() => {
                          setSubmitError(null);
                          setSubmitSuccess(false);
                          setResumeFile(null);
                          setCoverLetter("");
                          setShowApplyModal(true);
                        }}
                      >
                        Apply Now <i className="fal fa-arrow-right-long ms-2" />
                      </button>
                    </div>
                  )}

                  {applied && (
                    <div className="alert alert-success d-flex align-items-center mt-4">
                      <i className="fal fa-check-circle fa-2x me-3" />
                      <div>
                        <h5 className="alert-heading mb-1">Application Submitted!</h5>
                        <p className="mb-0">Your application is under review.</p>
                      </div>
                    </div>
                  )}

                  {isJobProvider && (
                    <div className="alert alert-info mt-4">
                      You are a Job Provider. You cannot apply to jobs.
                    </div>
                  )}
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
                        <JobPriceWidget job={job} />
                        <JobContactWidget job={job} />
                      </div>
                    </div>
                  </Sticky>
                ) : (
                  <div className="scrollbalance-inner">
                    <div className="blog-sidebar ms-lg-auto">
                      <JobPriceWidget job={job} />
                      <JobContactWidget job={job} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {showApplyModal && (
        <>
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 2000,
              // ensure the overlay captures clicks but doesn't block the dialog
              pointerEvents: "auto",
            }}
            // Only close when clicking directly on the overlay (not when clicks bubble from inside the modal)
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowApplyModal(false);
            }}
          />
          <div
            className="modal-dialog"
            // Prevent clicks inside the modal from bubbling to the overlay
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 2001,
              pointerEvents: "auto",
              width: "90%",
              maxWidth: 600,
              background: "#fff",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h4 className="mb-4">Apply for {job.job_title}</h4>

            {submitSuccess && (
              <div className="alert alert-success d-flex align-items-center">
                <i className="fal fa-check-circle me-2"></i>
                <span>Application submitted successfully!</span>
              </div>
            )}

            <form onSubmit={handleApply}>
              <div className="mb-3">
                <label className="form-label">
                  Resume (PDF, DOC, DOCX) <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-control"
                  onChange={(e) => {
                    setResumeFile(e.target.files?.[0] || null);
                    setSubmitError(null);
                  }}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Cover Letter <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={coverLetter}
                  onChange={(e) => {
                    setCoverLetter(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder="Explain why you're a great fit..."
                  required
                />
              </div>

              {submitError && (
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="fal fa-exclamation-circle me-2"></i>
                  <span>{submitError}</span>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-thm"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </>
  );
}