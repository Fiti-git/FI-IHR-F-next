"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function AppliedJobDetailPage() {
  const params = useParams();
  // Ensure jobId is an integer
  const jobId = parseInt(params.id, 10);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [isJobOpen, setIsJobOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // ← Moved UP
  const [interviewOpen, setInterviewOpen] = useState(true);
  const [offers, setOffers] = useState([]);
  const [offersOpen, setOffersOpen] = useState(true);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerFiles, setOfferFiles] = useState([]);


  const API_BASE_URL = "http://127.0.0.1:8000/api";

  // -----------------------------------------------------------------
  // Helpers (same as before)
  // -----------------------------------------------------------------
  const safeParseInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  // Ensure value is an array for safe mapping/joining.
  const safeArray = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      const s = v.trim();
      // try JSON array
      if (s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // fallthrough
        }
      }
      // comma-separated
      return s.split(',').map((x) => x.trim()).filter(Boolean);
    }
    if (typeof v === 'object') {
      try {
        return Object.values(v).filter((x) => x !== undefined && x !== null);
      } catch (e) {
        return [v];
      }
    }
    return [v];
  };

  const formatNumber = (n) => {
    if (n === undefined || n === null || n === '') return 'N/A';
    const num = Number(n);
    return Number.isFinite(num) ? num.toLocaleString() : String(n);
  };

  const normalizeStatus = (s) => {
    if (!s) return "";
    const v = String(s).trim().toLowerCase();
    if (v.includes("reject")) return "Rejected";
    if (v.includes("accept")) return "Accepted";
    if (v.includes("schedule")) return "Scheduled";
    if (v.includes("pending")) return "Pending";
    if (v.includes("open")) return "Open";
    if (v.includes("close")) return "Closed";
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const getCurrentFreelancerId = () => {
    const keys = ["freelancerId", "freelance_id", "freelancer_id", "userId", "user_id"];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      const n = safeParseInt(v);
      if (n) return n;
    }
    // Fallback: try to decode from JWT
    const token = localStorage.getItem("access_token");
    if (token) {
      const payload = decodeJwt(token) || {};
      const possibleKeys = ["freelancer_id", "freelance_id", "user_id", "id"];
      for (const k of possibleKeys) {
        const parsed = safeParseInt(payload?.[k]);
        if (parsed) return parsed;
      }
    }
    return null;
  };

  // -----------------------------------------------------------------
  // Fetch Job + Transform
  // -----------------------------------------------------------------
  useEffect(() => {
    async function fetchJob() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Access token not found. Please log in again.");
        }

        const res = await api.get(`/api/job-posting/${jobId}/`);
        setJob(res.data);

        // Derive Open/Closed from application_deadline when available
        try {
          if (res.data?.application_deadline) {
            const deadline = new Date(res.data.application_deadline);
            setIsJobOpen(!isNaN(deadline) ? Date.now() <= deadline.getTime() : true);
          } else {
            setIsJobOpen(true);
          }
        } catch {
          setIsJobOpen(true);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  // // --- Fetch Interview Info (FIXED) ---
  // useEffect(() => {
  //   async function fetchInterviews() {
  //     try {
  //       const token = localStorage.getItem("access_token");
  //       if (!token) {
  //         return;
  //       }

  //       const res = await api.get(`/api/job-interview/${jobId}/`);
  //       const data = res.data;

  //       // Handle both single object and array responses
  //       let interviews = [];
  //       if (Array.isArray(data)) {
  //         interviews = data;
  //       } else if (data && typeof data === 'object' && data.interview_id) {
  //         interviews = [data];
  //       }

  //       if (interviews.length === 0) {
  //         return;
  //       }

  //       // Filter and sort by 'date_time'
  //       const latest = interviews
  //         .filter(iv => iv && iv.date_time)
  //         .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))[0] || interviews[0];

  //       if (!latest) return;

  //       // Use 'date_time' from the API response
  //       const d = new Date(latest.date_time);

  //       // Use "Scheduled" as a default status if the 'status' field is missing in the interview object
  //       // const rawInterviewStatus = latest.status || "Scheduled";
  //       const rawInterviewStatus = "Scheduled";
  //       const status = normalizeStatus(rawInterviewStatus);

  //       if (!isNaN(d)) {
  //         const date = d.toLocaleDateString();
  //         const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  //         setInterviewDetails({
  //           date,
  //           time,
  //           link: latest.interview_link || "",
  //           mode: latest.interview_mode || "",
  //           status: status,
  //           notes: latest.interview_notes || "",
  //         });
  //       } else {
  //         setInterviewDetails({
  //           date: latest.date_time,
  //           time: "Time N/A",
  //           link: latest.interview_link || "",
  //           mode: latest.interview_mode || "",
  //           status: status,
  //           notes: latest.interview_notes || "",
  //         });
  //       }

  //       // Update the main application status based on the latest interview status (normalized)
  //       setApplicationStatus(status);
  //     } catch (err) {
  //       console.error("Error fetching interviews:", err);
  //       if (err.response?.status !== 404) {
  //         console.warn(`Failed to fetch interviews. Continuing.`);
  //       }
  //       // setUserApplicationStatus("");
  //       setInterviewDetails(null);
  //     }
  //   }

  //   if (jobId && !isNaN(jobId)) {
  //     fetchInterviews();
  //   }
  // }, [jobId]);

  // -----------------------------------------------------------------
  // Fetch Application Status
  // -----------------------------------------------------------------
  useEffect(() => {
    async function fetchAppStatus() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await api.get(`/api/job-application/job/${jobId}`);
        const data = res.data;

        const apps = Array.isArray(data) ? data : Array.isArray(data?.applications) ? data.applications : [];
        if (!apps.length) {
          setApplicationStatus("");
          return;
        }

        const myId = getCurrentFreelancerId();
        if (!myId) return;

        const mine = apps.find((a) => {
          const ids = [a.freelancer_id, a.freelance_id, a.freelancer_user_id];
          return ids.some((id) => safeParseInt(id) === myId);
        });

        if (mine) setApplicationStatus(normalizeStatus(mine.status));
        // Store the application id so we can fetch interview by application
        if (mine) {
          const appId = safeParseInt(mine.application_id || mine.applicationId || mine.id);
          if (appId) setApplicationId(appId);
        }

        // Normalize status (e.g., "Pending" -> "Pending", "Rejected" -> "Rejected", etc.)
        const rawAppStatus = (mine?.status || "").trim();
        const normalized = normalizeStatus(rawAppStatus);

        // If the API uses 'Pending' or similar, leave it as Pending; Accepted/Rejected will be normalized
        setApplicationStatus(normalized);
      } catch (err) {
        console.error("Error fetching applications:", err);
        if (err.response?.status !== 404) {
          console.warn(`Failed to fetch applications.`);
        }
        setApplicationStatus("");
      }
    }
    if (jobId) fetchAppStatus();
  }, [jobId]);

  // -----------------------------------------------------------------
  // Fetch Interview Details
  // -----------------------------------------------------------------
  // Fetch interview details by application id (new endpoint)
  useEffect(() => {
    async function fetchInterview() {
      try {
          // use the same storage key used elsewhere in the app
          const token = localStorage.getItem("access_token");
          if (!token) return;

          const res = await fetch(`${API_BASE_URL}/job-interview/application/${applicationId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;

        const data = await res.json();
        // Support either single object or array responses
        const interviews = Array.isArray(data) ? data : data?.application_id ? [data] : [];
        if (!interviews.length) return;

        // Prefer entries with interview_date or date_time, sort newest first
        const latest = interviews
          .filter((i) => i?.interview_date || i?.date_time)
          .sort((a, b) => new Date(b.interview_date || b.date_time) - new Date(a.interview_date || a.date_time))[0] || interviews[0];

        if (!latest) return;

        const rawDate = latest.interview_date || latest.date_time || latest.interview_date_time;
        const d = new Date(rawDate);
        const date = isNaN(d) ? rawDate : d.toLocaleDateString();
        const time = isNaN(d) ? "N/A" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        setInterviewDetails({
          date,
          time,
          link: latest.interview_link || "",
          mode: latest.interview_mode || latest.interviewMode || "",
          status: normalizeStatus(latest.status || "Scheduled"),
          notes: latest.interview_notes || latest.interviewNotes || "",
        });
      } catch (e) {
        console.error(e);
      }
    }
    if (applicationId) fetchInterview();
  }, [applicationId]);

  // -----------------------------------------------------------------
  // Fetch Offers
  // -----------------------------------------------------------------
  useEffect(() => {
    async function fetchOffers() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token || !applicationId) return;

        const res = await api.get('/api/job-offer/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.offers) {
          // Filter offers for this application
          const appOffers = res.data.offers.filter(
            (offer) => offer.application_id === applicationId
          );
          setOffers(appOffers);
        }
      } catch (e) {
        console.error('Error fetching offers:', e);
      }
    }
    if (applicationId) fetchOffers();
  }, [applicationId]);

  // -----------------------------------------------------------------
  // Update Offer
  // -----------------------------------------------------------------
  const handleUpdateOffer = async (offerId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert('Not authenticated');
        return;
      }

      const formData = new FormData();
      
      // Parse offer_details if it's a string
      let offerDetails = editingOffer.offer_details;
      if (typeof offerDetails === 'string') {
        try {
          offerDetails = JSON.parse(offerDetails);
        } catch (e) {
          console.error('Error parsing offer_details:', e);
        }
      }

      // Append offer details
      formData.append('offer_id', offerId);
      formData.append('offer_status', editingOffer.offer_status);
      formData.append('offer_details', JSON.stringify(offerDetails));
      
      // Append files
      offerFiles.forEach((file) => {
        formData.append('multi_doc', file);
      });

      const res = await api.put('/api/job-offer/update/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data) {
        // Update local state
        setOffers((prev) =>
          prev.map((offer) =>
            offer.offer_id === offerId ? { ...offer, ...res.data } : offer
          )
        );
        setEditingOffer(null);
        setOfferFiles([]);
        alert('Offer updated successfully!');
      }
    } catch (e) {
      console.error('Error updating offer:', e);
      alert('Failed to update offer: ' + (e.response?.data?.detail || e.message));
    }
  };

  // -----------------------------------------------------------------
  // EARLY RETURNS (AFTER ALL HOOKS)
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Loading job details...</h2>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Job not found</h2>
        <p className="text-danger">{error}</p>
        <Link href="/manage-myjobs" className="btn btn-primary mt-3">
          Back to Applied Jobs
        </Link>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // Tab Content Renderer
  // -----------------------------------------------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="text-muted mt-3">
            {/* <p><strong>Description:</strong> {job.description}</p> */}
            <p><strong>Role Overview:</strong> {job.role_overview}</p>
            <p><strong>Department / Team:</strong> {job.department}</p>
            <p><strong>Job Type:</strong> {job.job_type}</p>
            <p><strong>Work Location:</strong> {job.work_location}</p>
            <p><strong>Work Mode:</strong> {job.work_mode}</p>
            <p><strong>Date Posted:</strong> {job.date_posted}</p>
            <p>
              <strong>Status:</strong>{" "}
              {job.job_status ? job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1).toLowerCase() : "Unknown"}
            </p>
          </div>
        );

      case "responsibilities":
        return (
          <ul className="mt-3 text-muted">
            {safeArray(job.key_responsibilities).length ? (
              safeArray(job.key_responsibilities).map((item, i) => <li key={i}>{item}</li>)
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
              {safeArray(job.required_qualifications).length ? (
                safeArray(job.required_qualifications).map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>No required qualifications listed</li>
              )}
            </ul>

            <p><strong>Preferred Qualifications:</strong></p>
            <ul>
              {safeArray(job.preferred_qualifications).length ? (
                safeArray(job.preferred_qualifications).map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>No preferred qualifications listed</li>
              )}
            </ul>

            <p>
              <strong>Languages Required:</strong>{" "}
              {safeArray(job.language_required).length ? safeArray(job.language_required).join(", ") : "None specified"}
            </p>
          </div>
        );

      case "application":
        return (
          <div className="mt-3 text-muted">
            <p><strong>Application Deadline:</strong> {job.application_deadline || "N/A"}</p>
            {/* <p><strong>Application Method:</strong> {job.applicationMethod || "N/A"}</p> */}
            <p><strong>Interview Mode:</strong> {job.interview_mode || "N/A"}</p>
            <p><strong>Hiring Manager:</strong> {job.hiring_manager || "N/A"}</p>
            <p><strong>Number of Openings:</strong> {job.number_of_openings || "N/A"}</p>
            <p><strong>Expected Start Date:</strong> {job.expected_start_date || "N/A"}</p>
            <p><strong>Screening Questions:</strong></p>
            <ul>
              {safeArray(job.screening_questions).length ? (
                safeArray(job.screening_questions).map((q, i) => <li key={i}>{q}</li>)
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
              <strong>Salary Range:</strong>{" "}
              {formatNumber(job.salary_from)} - {formatNumber(job.salary_to)} {job.currency || ''}
            </p>
            <p><strong>Benefits:</strong></p>
            <ul>
              <li>Health Insurance: {job.health_insurance ? "Yes" : "No"}</li>
              <li>Remote Work: {job.remote_work ? "Yes" : "No"}</li>
              <li>Paid Leave: {job.paid_leave ? "Yes" : "No"}</li>
              <li>Bonus: {job.bonus ? "Yes" : "No"}</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  // -----------------------------------------------------------------
  // Compute Display Status
  // -----------------------------------------------------------------
  const displayStatus = (() => {
    if (applicationStatus === "Rejected") return "Rejected";
    if (applicationStatus === "Accepted") return "Accepted";
    if (interviewDetails?.status === "Scheduled") return "Scheduled";
    return isJobOpen ? "Open" : "Closed";
  })();

  const badgeCls =
    {
      Rejected: "pending-style style3",
      Accepted: "pending-style style2",
      Scheduled: "pending-style style6",
      Open: "pending-style style2",
      Closed: "pending-style style4",
    }[displayStatus] || "pending-style style5";

  // -----------------------------------------------------------------
  // Final JSX
  // -----------------------------------------------------------------
  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      {/* Header */}
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{job.job_title}</h2>
            </div>
            <div>
              <Link href="/manage-myjobs" className="ud-btn btn-dark default-box-shadow2">
                Back to Applied Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className="mb-4">
        <strong>Application Status: </strong>
        <span className={badgeCls}>{displayStatus}</span>
      </div>

      {/* Tabs */}
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <h5 className="fw500 mb-3">Job Details</h5>
            <ul className="nav nav-tabs">
              {["overview", "responsibilities", "qualifications", "application", "salaryBenefits"].map((t) => (
                <li className="nav-item" key={t}>
                  <button
                    className={`nav-link ${activeTab === t ? "active" : ""}`}
                    onClick={() => setActiveTab(t)}
                    style={{ color: 'black' }}
                  >
                    {t.charAt(0).toUpperCase() +
                      t
                        .slice(1)
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </button>
                </li>
              ))}
            </ul>
            <div className="tab-content p-3 border-top">{renderTabContent()}</div>
          </div>
        </div>
      </div>

      {/* Interview Details - styled like Applicant List table (collapsible) */}
      {interviewDetails && (
        <div className="row mt-4">
          <div className="col-xl-12">
            <div className="mb-4 border rounded p-3">
              <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setInterviewOpen(!interviewOpen)}
              >
                <h5 className="fw500 mb-0">Interview Details (Latest)</h5>
                <span>{interviewOpen ? "−" : "+"}</span>
              </div>

              {interviewOpen && (
                <div className="mt-3 table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <div className="bgc-white p-3 bdrs4">
                    <div className="text-muted">
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={badgeCls}>{interviewDetails.status}</span>
                      </p>
                      <p><strong>Date:</strong> {interviewDetails.date}</p>
                      <p><strong>Time:</strong> {interviewDetails.time}</p>
                      {interviewDetails.link && (
                        <p style={{ display: 'flex', alignItems: 'center' }}>
                          <strong>Link:</strong>{' '}
                          <a href={interviewDetails.link} target="_blank" rel="noopener noreferrer" className="ud-btn btn-thm" style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none', display: 'inline-block', marginLeft: '8px' }}>
                            Join Interview
                          </a>
                        </p>
                      )}
                      {interviewDetails.mode && <p><strong>Mode:</strong> {interviewDetails.mode.toUpperCase()}</p>}
                      {interviewDetails.notes && (
                        <p style={{ whiteSpace: 'pre-line' }}>
                          <strong>Notes:</strong> {interviewDetails.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Offers Section - styled like Interview Details */}
      {offers && offers.length > 0 && (
        <div className="row mt-4">
          <div className="col-xl-12">
            <div className="mb-4 border rounded p-3">
              <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setOffersOpen(!offersOpen)}
              >
                <h5 className="fw500 mb-0">Offers</h5>
                <span>{offersOpen ? "−" : "+"}</span>
              </div>

              {offersOpen && (
                <div className="mt-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {offers.map((offer) => {
                    const isEditing = editingOffer?.offer_id === offer.offer_id;
                    let parsedDetails = {};
                    
                    // Parse offer_details
                    if (offer.offer_details) {
                      try {
                        parsedDetails = typeof offer.offer_details === 'string' 
                          ? JSON.parse(offer.offer_details) 
                          : offer.offer_details;
                      } catch (e) {
                        console.error('Error parsing offer_details:', e);
                      }
                    }

                    return (
                      <div key={offer.offer_id} className="bgc-white p-3 bdrs4 mb-3 border">
                        <div className="text-muted">
                          {!isEditing ? (
                            <>
                              <p>
                                <strong>Status:</strong>{' '}
                                <span className={`pending-style ${
                                  offer.offer_status?.toLowerCase() === 'pending' ? 'style6' :
                                  offer.offer_status?.toLowerCase() === 'accepted' ? 'style2' :
                                  offer.offer_status?.toLowerCase() === 'rejected' ? 'style3' : 'style5'
                                }`}>
                                  {offer.offer_status}
                                </span>
                              </p>
                              <p><strong>Date Offered:</strong> {new Date(offer.date_offered).toLocaleString()}</p>
                              {parsedDetails.salary && <p><strong>Salary:</strong> {parsedDetails.salary}</p>}
                              {parsedDetails.start_date && <p><strong>Start Date:</strong> {parsedDetails.start_date}</p>}
                              {parsedDetails.benefits && (
                                <div>
                                  <strong>Benefits:</strong>
                                  <ul className="mt-2">
                                    {Array.isArray(parsedDetails.benefits) ? (
                                      parsedDetails.benefits.map((benefit, idx) => (
                                        <li key={idx}>{benefit}</li>
                                      ))
                                    ) : (
                                      <li>{parsedDetails.benefits}</li>
                                    )}
                                  </ul>
                                </div>
                              )}
                              {offer.date_accepted && (
                                <p><strong>Date Accepted:</strong> {new Date(offer.date_accepted).toLocaleString()}</p>
                              )}
                              {offer.date_rejected && (
                                <p><strong>Date Rejected:</strong> {new Date(offer.date_rejected).toLocaleString()}</p>
                              )}
                              {offer.multi_doc && (
                                <div>
                                  <strong>Documents:</strong>
                                  <ul className="mt-2">
                                    {(() => {
                                      // Handle both single file path and array of files
                                      const docs = Array.isArray(offer.multi_doc) ? offer.multi_doc : [offer.multi_doc];
                                      return docs.map((doc, idx) => {
                                        const fullUrl = doc.startsWith('http') ? doc : `http://127.0.0.1:8000${doc}`;
                                        // Extract filename from path
                                        const filename = doc.split('/').pop() || `Document ${idx + 1}`;
                                        return (
                                          <li key={idx}>
                                            <a 
                                              href={fullUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-primary"
                                            >
                                              {decodeURIComponent(filename)}
                                            </a>
                                          </li>
                                        );
                                      });
                                    })()}
                                  </ul>
                                </div>
                              )}
                              <button
                                className="ud-btn btn-thm mt-2"
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                onClick={() => {
                                  setEditingOffer({
                                    offer_id: offer.offer_id,
                                    offer_status: offer.offer_status,
                                    offer_details: offer.offer_details,
                                  });
                                  setOfferFiles([]);
                                }}
                              >
                                Edit Offer
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="mb-3">
                                <label className="form-label"><strong>Salary:</strong></label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={parsedDetails.salary || ''}
                                  readOnly
                                  disabled
                                  style={{ backgroundColor: '#f5f5f5' }}
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label"><strong>Start Date:</strong></label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={parsedDetails.start_date || ''}
                                  readOnly
                                  disabled
                                  style={{ backgroundColor: '#f5f5f5' }}
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label"><strong>Benefits:</strong></label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={
                                    Array.isArray(parsedDetails.benefits) 
                                      ? parsedDetails.benefits.join(', ') 
                                      : parsedDetails.benefits || ''
                                  }
                                  readOnly
                                  disabled
                                  style={{ backgroundColor: '#f5f5f5' }}
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label"><strong>Status:</strong></label>
                                <select
                                  className="form-select"
                                  value={editingOffer.offer_status}
                                  onChange={(e) => setEditingOffer({
                                    ...editingOffer,
                                    offer_status: e.target.value
                                  })}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </div>

                              <div className="mb-3">
                                <label className="form-label"><strong>Upload Documents:</strong></label>
                                <input
                                  type="file"
                                  multiple
                                  className="form-control"
                                  onChange={(e) => setOfferFiles(Array.from(e.target.files))}
                                />
                                {offerFiles.length > 0 && (
                                  <small className="text-muted d-block mt-1">
                                    {offerFiles.length} file(s) selected
                                  </small>
                                )}
                              </div>

                              <div className="d-flex gap-2">
                                <button
                                  className="ud-btn btn-thm"
                                  style={{ padding: '6px 12px', fontSize: '13px' }}
                                  onClick={() => handleUpdateOffer(offer.offer_id)}
                                >
                                  Save Changes
                                </button>
                                <button
                                  className="ud-btn btn-dark"
                                  style={{ padding: '6px 12px', fontSize: '13px' }}
                                  onClick={() => {
                                    setEditingOffer(null);
                                    setOfferFiles([]);
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}