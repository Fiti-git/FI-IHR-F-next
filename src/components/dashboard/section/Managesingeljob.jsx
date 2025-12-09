"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';


// Normalize resume URL similar to ProfileDetails.jsx
const getFullResumeUrl = (resume) => {
  if (!resume) return null;
  if (typeof resume !== 'string') return null;
  // if already absolute URL, return as-is
  if (resume.startsWith('http')) return resume;
  // otherwise prefix with local dev server host
  const base = API_BASE_URL;
  return base + (resume.startsWith('/') ? resume : '/' + resume);
};
// -------------------------------------------------------------------
// POST /api/chat/start/
// -------------------------------------------------------------------
const startChat = async (userId) => {
  try {
    const res = await api.post('/api/chat/start/', { user_id: userId });
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message || `Failed to start chat: ${error.response?.status}`;
    throw new Error(errorMsg);
  }
};

const fetchJobDetails = async (jobId) => {
  try {
    const response = await api.get(`/api/job-posting/${jobId}/`);
    console.log('API Response:', response.data);
    console.log('Key Responsibilities type:', typeof response.data.key_responsibilities);
    console.log('Key Responsibilities value:', response.data.key_responsibilities);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error.response?.data || error.message);
    return null;
  }
};

const fetchJobApplications = async (jobId) => {
  try {
    const res = await api.get(`/api/job-application/job/${jobId}/`);
    const data = res.data;
    // API may return { applications: [...] } or an array directly
    const arr = data && Array.isArray(data.applications) ? data.applications : data;
    return { data: Array.isArray(arr) ? arr : [], error: null };
  } catch (e) {
    const err = e.response?.data?.detail || e.message || String(e);
    console.error('Error fetching applications', err);
    return { data: [], error: err };
  }
};

// Fetch interview info for a given application id
const fetchInterviewForApplication = async (applicationId) => {
  try {
    if (!applicationId) return null;
    const res = await api.get(`/api/job-interview/application/${applicationId}/`);
    return res.data;
  } catch (e) {
    // don't fail hard for interview fetches; return null
    console.debug('No interview data for application', applicationId, e.response?.status);
    return null;
  }
};

// Convert backend ISO interview_date (UTC) to a value suitable for <input type="datetime-local"> (local time)
const convertIsoToDatetimeLocal = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
};

// Convert a local datetime-local value to ISO string (UTC) for backend
const convertDatetimeLocalToIso = (localValue) => {
  if (!localValue) return null;
  try {
    // localValue is like '2025-10-27T14:30'
    const d = new Date(localValue);
    if (isNaN(d)) return null;
    return d.toISOString();
  } catch (e) {
    return null;
  }
};

// -------------------------------------------------------------------
// POST /api/job-offer/create
// -------------------------------------------------------------------
const createJobOffer = async (applicationId, offerData) => {
  const payload = {
    application_id: applicationId,
    offer_status: 'Pending',                     // always Pending on creation
    offer_details: {
      salary: Number(offerData.salary.trim()),   // numeric
      start_date: offerData.starting_date,       // YYYY-MM-DD
      benefits: offerData.benefits
        .split('\n')                              // textarea → lines
        .map(l => l.trim())
        .filter(l => l),                          // non-empty strings
    },
  };

  try {
    const res = await api.post('/api/job-offer/create/', payload);
    return res.data; // {offer_id:…, message:…}
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.message || `Failed to create offer: ${error.response?.status}`;
    throw new Error(errorMsg);
  }
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id, 10);
  const router = useRouter();
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
  // Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerApplicant, setOfferApplicant] = useState(null);
  const [offerData, setOfferData] = useState({ salary: '', starting_date: '', benefits: '' });
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerError, setOfferError] = useState(null);
  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentChatApplicant, setCurrentChatApplicant] = useState(null);
  const [conversationId, setConversationId] = useState(null);


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
      const body = {};
      if (rating !== undefined && rating !== null) body.rating = String(rating);
      if (status !== undefined) body.status = status;
      if (comments !== undefined) body.comments = comments;

      const res = await api.put(`/api/job-application/update/${applicationId}/`, body);
      return res.data || body;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || `Failed to update application: ${err.response?.status}`;
      setApplicationUpdateError(prev => ({ ...prev, [applicationId]: errorMsg }));
      throw new Error(errorMsg);
    } finally {
      setApplicationUpdating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Start chat with applicant
  const handleStartChat = async (applicant) => {
    if (loading) return;
    setLoading(true);
    try {
      const userId = applicant.raw.freelancer_user_id;
      if (!userId) throw new Error("No user ID found for this applicant.");
      const conversation = await startChat(userId);

      if (conversation?.id) {
        router.push(`/message?conversation_id=${conversation.id}`);
      } else {
        throw new Error("Conversation ID missing from server response.");
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("Could not start chat: " + error.message);
    } finally {
      setLoading(false);
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

    const applicationId = getApplicationIdFromApplicant(scheduleApplicant);
    const jobIdForPayload = job?.id ?? (Number.isFinite(jobId) ? jobId : null);
    const freelanceId = scheduleApplicant.raw?.freelance_id ?? scheduleApplicant.raw?.freelancer_id ?? scheduleApplicant.freelance_id ?? null;

    if (!jobIdForPayload) {
      alert('Missing job_id for scheduling.');
      return;
    }
    if (!freelanceId) {
      alert('Missing freelance_id for scheduling.');
      return;
    }

    const payload = {
      application_id: applicationId,
      job_id: jobIdForPayload,
      freelance_id: freelanceId,
      date_time: convertDatetimeLocalToIso(scheduleData.date_time),
      interview_mode: INTERVIEW_MODE_MAP[scheduleData.interview_mode] || scheduleData.interview_mode,
      interview_link: scheduleData.interview_link || null,
      interview_notes: scheduleData.interview_notes || null,
    };

    setScheduleSaving(true);
    setScheduleError(null);

    try {
      const res = await api.post('/api/job-interview/schedule/', payload);
      const saved = res.data || payload;

      setSchedules(prev => ({ ...prev, [scheduleApplicant.id]: saved }));
      setApplicants(prev => prev.map(a => a.id === scheduleApplicant.id ? { ...a, schedule: saved } : a));

      setShowScheduleModal(false);
      setScheduleApplicant(null);
      setScheduleData({ date_time: '', interview_mode: 'Zoom', interview_link: '', interview_notes: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || String(err);
      console.error('Schedule save error', errorMsg);
      setScheduleError(errorMsg);
      alert('Could not save schedule: ' + errorMsg);
    } finally {
      setScheduleSaving(false);
    }
  };

  // Save offer locally (no API) -- attaches offer to applicant in local state
  const handleSaveOffer = async () => {
    if (!offerApplicant || !offerApplicant.id) {
      alert('No applicant selected');
      return;
    }
    if (!offerData.salary || !offerData.starting_date) {
      alert('Please provide salary and starting date');
      return;
    }
    setOfferSaving(true);
    setOfferError(null);
    try {
      // store offer on applicant locally
      setApplicants(prev => prev.map(a => a.id === offerApplicant.id ? { ...a, offer: { ...offerData } } : a));
      // close modal
      setShowOfferModal(false);
      setOfferApplicant(null);
      setOfferData({ salary: '', starting_date: '', benefits: '' });
    } catch (e) {
      console.error('Error saving offer', e);
      setOfferError(String(e));
      alert('Could not save offer: ' + (e.message || String(e)));
    } finally {
      setOfferSaving(false);
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
      // If applicant was accepted, reject other applicants and update the job posting to closed
      if (confirmAction === 'Accepted' && job && job.id) {
        // capture previous applicants state so we can revert if needed
        const prevApplicants = applicants;
        try {
          // Reject other applicants (optimistic update)
          const others = Array.isArray(applicants) ? applicants.filter(a => a.id !== confirmApplicant.id && (a.status || '').toLowerCase() !== 'rejected') : [];
          if (others.length > 0) {
            // optimistic: mark others as Rejected locally
            setApplicants(prev => prev.map(a => a.id !== confirmApplicant.id ? { ...a, status: 'Rejected' } : a));

            // send updates in parallel, but capture failures per-applicant
            const rejectResults = await Promise.all(others.map(async (other) => {
              const otherAppId = getApplicationIdFromApplicant(other) || other.id;
              try {
                await updateApplication(otherAppId, { status: 'Rejected' });
                return { id: other.id, ok: true };
              } catch (e) {
                return { id: other.id, ok: false, error: e };
              }
            }));

            const failed = rejectResults.filter(r => !r.ok);
            if (failed.length > 0) {
              // revert any that failed back to their original status
              setApplicants(prev => prev.map(a => {
                const f = failed.find(x => x.id === a.id);
                if (f) {
                  const original = prevApplicants.find(p => p.id === a.id);
                  return original ? { ...a, status: original.status } : a;
                }
                return a;
              }));
              console.error('Failed to auto-reject some applicants', failed);
              alert(`Applicant accepted but failed to reject ${failed.length} other applicant(s). Check console for details.`);
            }
          }

          // Close the job posting on the backend
          try {
            await updateJobPosting(job.id, { job_status: 'closed' });
            // update UI state: show Closed
            setJob(prev => ({ ...prev, status: 'Closed', selectedCandidate: confirmApplicant.name }));
          } catch (err) {
            console.error('Could not update job status to closed', err);
            alert('Applicant accepted but failed to close job: ' + (err.message || String(err)));
          }
        } catch (err) {
          // any unexpected error: revert optimistic applicant changes
          console.error('Error rejecting other applicants', err);
          setApplicants(prevApplicants);
          alert('Applicant accepted but an error occurred while rejecting other applicants: ' + (err.message || String(err)));
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
      const fromRaw = job?.raw || {};
      const payload = {
        job_title: fromRaw.job_title ?? job?.title ?? '',
        department: fromRaw.department ?? job?.department ?? '',
        job_type: fromRaw.job_type ?? job?.jobType ?? '',
        work_location: fromRaw.work_location ?? job?.workLocation ?? '',
        work_mode: fromRaw.work_mode ?? job?.workMode ?? '',
        role_overview: fromRaw.role_overview ?? job?.roleOverview ?? '',
        key_responsibilities: fromRaw.key_responsibilities ?? job?.keyResponsibilities ?? '',
        required_qualifications: fromRaw.required_qualifications ?? job?.requiredQualifications ?? '',
        preferred_qualifications: fromRaw.preferred_qualifications ?? job?.preferredQualifications ?? '',
        languages_required: fromRaw.languages_required ?? fromRaw.language_required ?? job?.languagesRequired ?? '',
        job_category: fromRaw.job_category ?? job?.category ?? '',
        salary_from: fromRaw.salary_from ?? job?.salaryFrom ?? '',
        salary_to: fromRaw.salary_to ?? job?.salaryTo ?? '',
        currency: fromRaw.currency ?? job?.currency ?? '',
        application_deadline: fromRaw.application_deadline ?? job?.applicationDeadline ?? null,
        application_method: fromRaw.application_method ?? job?.applicationMethod ?? '',
        interview_mode: fromRaw.interview_mode ?? job?.interviewMode ?? '',
        hiring_manager: fromRaw.hiring_manager ?? job?.hiringManager ?? '',
        number_of_openings: fromRaw.number_of_openings ?? job?.numberOfOpenings ?? 1,
        expected_start_date: fromRaw.expected_start_date ?? job?.expectedStartDate ?? null,
        screening_questions: fromRaw.screening_questions ?? job?.screeningQuestions ?? '',
        file_upload: fromRaw.file_upload ?? '',
        health_insurance: fromRaw.health_insurance ?? job?.benefits?.healthInsurance ?? false,
        remote_work: fromRaw.remote_work ?? job?.benefits?.remoteWork ?? false,
        paid_leave: fromRaw.paid_leave ?? job?.benefits?.paidLeave ?? false,
        bonus: fromRaw.bonus ?? job?.benefits?.bonus ?? false,
        job_status: updates.job_status ?? fromRaw.job_status ?? (job?.status ? String(job.status).toLowerCase() : 'open'),
      };

      Object.assign(payload, updates);

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (typeof v === 'string' && v.trim() === '') {
          delete payload[k];
        }
      });

      console.debug('updateJobPosting payload:', payload);

      const res = await api.put(`/api/job-posting/${jobId}/`, payload);
      return res.data || payload;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || `Failed to update job: ${err.response?.status}`;
      console.error('updateJobPosting error', errorMsg);
      throw new Error(errorMsg);
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
            // extract rating from possible backend fields (keep null if not present)
            rating: a.rating ?? a.application_rating ?? a.applicant_rating ?? a.rating_value ?? null,
            raw: a,
          }));

          // populate ratings state so badges render even before user rates manually
          const ratingsFromApps = {};
          mapped.forEach((m) => {
            if (m.id != null && m.rating !== undefined && m.rating !== null && String(m.rating).trim() !== '') {
              const num = Number(m.rating);
              if (!Number.isNaN(num)) ratingsFromApps[m.id] = num;
            }
          });

          setRatings(ratingsFromApps);
          setApplicants(mapped);
          setApplicantsError(null);

          // Fetch interview info for each application to determine scheduled state
          try {
            const interviewPromises = mapped.map((m) => {
              // m.id should be the application id
              return m.id ? fetchInterviewForApplication(m.id) : Promise.resolve(null);
            });
            const interviewResults = await Promise.allSettled(interviewPromises);
            const schedulesFromApi = {};
            interviewResults.forEach((r, idx) => {
              if (r.status === 'fulfilled' && r.value) {
                const appId = mapped[idx].id;
                // store the returned interview object keyed by application id
                schedulesFromApi[appId] = r.value;
              }
            });
            // merge with any existing schedules
            setSchedules(prev => ({ ...prev, ...schedulesFromApi }));
          } catch (e) {
            console.error('Error fetching interviews for applications', e);
          }
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
              <span
                className={`pending-style ${job.status?.toLowerCase() === "open"
                  ? "style2"
                  : job.status?.toLowerCase() === "closed"
                    ? "style3"
                    : "style4"
                  }`}
              >
                {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1).toLowerCase() : "Unknown"}
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
                  style={{ color: 'black' }}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "responsibilities" ? "active" : ""}`}
                  onClick={() => setActiveTab("responsibilities")}
                  style={{ color: 'black' }}
                >
                  Responsibilities
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "qualifications" ? "active" : ""}`}
                  onClick={() => setActiveTab("qualifications")}
                  style={{ color: 'black' }}
                >
                  Qualifications
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "application" ? "active" : ""}`}
                  onClick={() => setActiveTab("application")}
                  style={{ color: 'black' }}
                >
                  Application Info
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "salaryBenefits" ? "active" : ""}`}
                  onClick={() => setActiveTab("salaryBenefits")}
                  style={{ color: 'black' }}
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
                            {/* Status tag in front of name: Accepted / Rejected / Pending */}
                            {(() => {
                              const st = (applicant.status || '').toLowerCase();
                              let label = 'Pending';
                              let cls = 'pending-style style1 ms-2'; // default: yellow/pending
                              if (st === 'accepted') { label = 'Accepted'; cls = 'pending-style style2 ms-2'; } // blue
                              else if (st === 'rejected') { label = 'Rejected'; cls = 'pending-style style3 ms-2'; } // red/pink
                              return (
                                <>
                                  {applicant.name}
                                  <span className={cls} title={`Status: ${label}`}>{label}</span>
                                  {ratings && ratings[applicant.id] ? (
                                    <span className="pending-style style5 ms-2" title={`Rating: ${ratings[applicant.id]}/5`}>
                                      <i className="fal fa-star me-1" />{ratings[applicant.id]}/5
                                    </span>
                                  ) : null}

                                  {/* Single interview tag: show only when interview exists. Label: Scheduled or Rescheduled */}
                                  {(() => {
                                    const iv = schedules && schedules[applicant.id];
                                    if (!iv) return null;
                                    const st = String(iv.status || '').toLowerCase();
                                    let label = 'Scheduled';
                                    let cls = 'pending-style style6 ms-2'; // blue for scheduled
                                    if (st.includes('resched') || st.includes('rescheduled') || st.includes('reschedule')) {
                                      label = 'Rescheduled';
                                      cls = 'pending-style style2 ms-2'; // also blue
                                    } else if (st.includes('scheduled') || st.includes('confirmed')) {
                                      label = 'Scheduled';
                                    }
                                    return (
                                      <span className={cls} title={iv?.interview_link ? `Interview link: ${iv.interview_link}` : `Status: ${iv.status || ''}`}>{label}</span>
                                    );
                                  })()}
                                </>
                              );
                            })()}
                          </td>
                          <td>
                            <button
                              className="ud-btn btn-thm-border me-2"
                              style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                              title="CV"
                              onClick={() => {
                                if (!applicant.resume) {
                                  alert('No resume available');
                                  return;
                                }
                                const url = getFullResumeUrl(applicant.resume) || applicant.resume;
                                try {
                                  window.open(url, '_blank');
                                } catch (e) {
                                  // fallback
                                  window.location.href = url;
                                }
                              }}
                            ><i className="fal fa-file-download" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }} /></button>
                            <button
                              className="ud-btn btn-thm-border me-2"
                              style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                              title="Rate"
                              onClick={() => {
                                setRatingApplicant(applicant);
                                setRatingValue(ratings && ratings[applicant.id] ? ratings[applicant.id] : 5);
                                setShowRatingModal(true);
                              }}
                            ><i className="fal fa-star" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }} /></button>
                            <button
                              className="ud-btn btn-thm-border me-2"
                              style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                              title="Schedule"
                              onClick={async () => {
                                setScheduleApplicant(applicant);
                                // Try to use cached schedule; if missing, fetch latest from API
                                let existing = schedules && schedules[applicant.id] ? schedules[applicant.id] : null;
                                if (!existing) {
                                  try {
                                    const fetched = await fetchInterviewForApplication(applicant.id);
                                    if (fetched) {
                                      setSchedules(prev => ({ ...prev, [applicant.id]: fetched }));
                                      existing = fetched;
                                    }
                                  } catch (e) {
                                    console.error('Error fetching interview on schedule click', e);
                                  }
                                }
                                setScheduleData(existing ? {
                                  date_time: convertIsoToDatetimeLocal(existing.interview_date) || '',
                                  interview_mode: existing.interview_mode || 'Zoom',
                                  interview_link: existing.interview_link || '',
                                  interview_notes: existing.interview_notes || '',
                                } : { date_time: '', interview_mode: 'Zoom', interview_link: '', interview_notes: '' });
                                setShowScheduleModal(true);
                              }}
                            ><i className="fal fa-calendar-alt" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }} /></button>
                            <button
                              className="ud-btn btn-thm-border me-2"
                              style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                              title="Chat"
                              onClick={() => handleStartChat(applicant)}
                            ><i className="fal fa-comments" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }} /></button>
                            <button
                              className="ud-btn btn-thm me-2"
                              style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                              title="Accept"
                              onClick={() => {
                                setConfirmApplicant(applicant);
                                setConfirmAction('Accepted');
                                setConfirmResult(null);
                                setShowConfirmModal(true);
                              }}
                            ><i className="fal fa-check" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }} /></button>
                            <button
                              className="ud-btn btn-dark"
                              style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                              title="Reject"
                              onClick={() => {
                                setConfirmApplicant(applicant);
                                setConfirmAction('Rejected');
                                setConfirmResult(null);
                                setShowConfirmModal(true);
                              }}
                            ><i className="fal fa-times" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }} /></button>
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
                              {(() => {
                                const iv = schedules && schedules[applicant.id];
                                if (!iv) return null;
                                const st = String(iv.status || '').toLowerCase();
                                let label = 'Scheduled';
                                let cls = 'pending-style style6 ms-2'; // blue for scheduled
                                if (st.includes('resched') || st.includes('rescheduled') || st.includes('reschedule')) {
                                  label = 'Rescheduled';
                                  cls = 'pending-style style2 ms-2'; // also blue
                                }
                                return (
                                  <span className={cls} title={iv?.interview_link ? `Interview link: ${iv.interview_link}` : `Status: ${iv.status || ''}`}>{label}</span>
                                );
                              })()}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-success me-2"
                                title="Offer"
                                onClick={() => {
                                  // open local offer modal
                                  setOfferApplicant(applicant);
                                  setOfferData({ salary: (applicant.offer && applicant.offer.salary) || '', starting_date: (applicant.offer && applicant.offer.starting_date) || '', benefits: (applicant.offer && applicant.offer.benefits) || '' });
                                  setShowOfferModal(true);
                                }}
                              >Offer</button>
                              <button
                                className="btn btn-sm btn-info me-2"
                                title="Chat"
                                onClick={() => handleStartChat(applicant)}
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
              <div className="mb-3">
                <label className="form-label">Rating (0 - 5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  className="form-control"
                  placeholder="Enter rating"
                  value={ratingValue}
                  onChange={(e) => setRatingValue(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="ud-btn btn-dark me-2" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => { setShowRatingModal(false); setRatingApplicant(null); }}>Cancel</button>
                <button className="ud-btn btn-thm" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={async () => {
                  if (!ratingApplicant || !ratingApplicant.id) {
                    alert('No applicant selected');
                    return;
                  }
                  const appId = getApplicationIdFromApplicant(ratingApplicant) || ratingApplicant.id;
                  // parse and validate rating
                  const parsed = Number(ratingValue);
                  if (Number.isNaN(parsed)) {
                    alert('Please enter a valid numeric rating');
                    return;
                  }
                  if (parsed < 0 || parsed > 5) {
                    alert('Please enter a rating between 0 and 5');
                    return;
                  }
                  // optimistic UI
                  setRatings(prev => ({ ...prev, [ratingApplicant.id]: parsed }));
                  setApplicants(prev => prev.map(a => a.id === ratingApplicant.id ? { ...a, rating: parsed } : a));
                  try {
                    await updateApplication(appId, { rating: parsed });
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
                <button className="ud-btn btn-dark me-2" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => { setShowScheduleModal(false); setScheduleApplicant(null); }}>Cancel</button>
                <button
                  className="ud-btn btn-thm"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
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
                    <button className="ud-btn btn-dark me-2" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => { setShowConfirmModal(false); setConfirmApplicant(null); setConfirmAction(null); setConfirmResult(null); }}>Cancel</button>
                    <button className="ud-btn btn-thm" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => handleConfirmAction()} disabled={confirmLoading}>
                      {confirmLoading ? 'Saving...' : confirmAction}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h5 className="mb-3">{confirmResult}</h5>
                  <div className="d-flex justify-content-end">
                    <button className="ud-btn btn-thm" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => { setShowConfirmModal(false); setConfirmApplicant(null); setConfirmAction(null); setConfirmResult(null); }}>OK</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal – now persists to the backend */}
      {showOfferModal && offerApplicant && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="bg-white p-4 rounded" style={{ width: 520 }}>
              <h5 className="mb-3">Send Offer to {offerApplicant.name}</h5>

              <div className="mb-2">
                <label className="form-label">Salary * (numeric)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  placeholder="e.g. 2500"
                  value={offerData.salary}
                  onChange={e => setOfferData(prev => ({ ...prev, salary: e.target.value }))}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Starting Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={offerData.starting_date}
                  onChange={e => setOfferData(prev => ({ ...prev, starting_date: e.target.value }))}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Benefits (one per line, optional)</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Health insurance&#10;Remote work&#10;Paid leave"
                  value={offerData.benefits}
                  onChange={e => setOfferData(prev => ({ ...prev, benefits: e.target.value }))}
                />
              </div>

              {offerError && <div className="text-danger mb-2">{offerError}</div>}

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setShowOfferModal(false);
                    setOfferApplicant(null);
                    setOfferData({ salary: '', starting_date: '', benefits: '' });
                    setOfferError(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  disabled={offerSaving}
                  onClick={async () => {
                    if (!offerData.salary || !offerData.starting_date) {
                      alert('Salary and Starting Date are required');
                      return;
                    }

                    setOfferSaving(true);
                    setOfferError(null);

                    try {
                      const applicationId = getApplicationIdFromApplicant(offerApplicant) || offerApplicant.id;
                      const apiResult = await createJobOffer(applicationId, offerData);

                      setApplicants(prev =>
                        prev.map(a =>
                          a.id === offerApplicant.id
                            ? { ...a, offer: { ...offerData, offer_id: apiResult.offer_id } }
                            : a
                        )
                      );

                      setShowOfferModal(false);
                      setOfferApplicant(null);
                      setOfferData({ salary: '', starting_date: '', benefits: '' });
                      alert('Offer sent successfully!');
                    } catch (err) {
                      console.error(err);
                      setOfferError(err.message || String(err));
                      alert('Could not send offer: ' + (err.message || String(err)));
                    } finally {
                      setOfferSaving(false);
                    }
                  }}
                >
                  {offerSaving ? 'Sending...' : 'Send Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
