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

  const handleApply = () => setApplied(true);

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
                  {!applied ? (
                    <Link
                      href="#"
                      className="ud-btn btn-thm2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleApply();
                      }}
                    >
                      Apply For Job
                      <i className="fal fa-arrow-right-long" />
                    </Link>
                  ) : (
                    <div className="success-message">Successfully Applied!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
