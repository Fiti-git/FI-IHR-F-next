"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";
import api from "@/lib/axios";

export default function SupportCenter() {
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ticketType, setTicketType] = useState("Project");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [relatedProjectId, setRelatedProjectId] = useState("");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [error, setError] = useState("");

  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          setTicketsLoading(false);
          return;
        }

        const response = await api.get(`/support/tickets/user/${userId}/`);
        const data = response.data;

        console.log("Fetched tickets data:", data);

        // Transform tickets from API response
        const transformedTickets = (data.tickets || []).map(ticket => ({
          id: ticket.id,
          subject: ticket.subject,
          description: ticket.description || "",
          priority: ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : "Low",
          status: ticket.status ? ticket.status.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Open",
          category: ticket.category,
          ticketType: ticket.ticket_type,
          referenceId: ticket.reference_id,
          referenceTitle: ticket.reference_title,
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
        }));

        console.log("Transformed tickets:", transformedTickets);
        setTickets(transformedTickets);
        setTicketsLoading(false);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setTicketsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Fetch user engagement data
  useEffect(() => {
    const fetchUserEngagement = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await api.get(`/support/user-engagement/${userId}/`);
        const data = response.data;

        // Transform projects and jobs into a unified array
        const projectsList = (data.projects || []).map(project => ({
          id: project.id,
          type: "Project",
          name: project.title,
          status: project.status
        }));

        const jobsList = (data.jobs || []).map(job => ({
          id: job.id,
          type: "Job",
          name: job.job_title,
          status: job.job_status
        }));

        const allEngagements = [...projectsList, ...jobsList];
        setUserProjects(allEngagements);
        
        // Set default selection to first project item
        if (projectsList.length > 0) {
          setRelatedProjectId(`${projectsList[0].type}-${projectsList[0].id}`);
        } else if (jobsList.length > 0) {
          setTicketType("Job");
          setRelatedProjectId(`${jobsList[0].type}-${jobsList[0].id}`);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user engagement:", err);
        setError("Failed to load projects and jobs. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserEngagement();
  }, []);

  const handleAddTicket = async (e) => {
    e.preventDefault();
    setError("");

    if (!subject.trim()) {
      setError("Please enter ticket subject.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter ticket description.");
      return;
    }
    if (!relatedProjectId) {
      setError("Please select a related project or job.");
      return;
    }
    if (!referenceTitle.trim()) {
      setError("Please enter reference title.");
      return;
    }

    try {
      // Parse the relatedProjectId (format: "Type-ID")
      const [type, id] = relatedProjectId.split("-");
      const relatedProject = userProjects.find(
        (p) => p.type === type && p.id === Number(id)
      );

      if (!relatedProject) {
        setError("Invalid project or job selection.");
        return;
      }

      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setError("User ID not found. Please log in again.");
        return;
      }

      // Prepare request payload according to API spec
      const payload = {
        user_id: parseInt(userId),
        ticket_type: type.toLowerCase(), // "project" or "job"
        reference_id: relatedProject.id,
        reference_title: referenceTitle.trim(),
        category: type.toLowerCase(), // "project" or "job"
        subject: subject.trim(),
        description: description.trim(),
        priority: priority.toLowerCase(), // "low", "medium", "high"
      };

      // Call API to create ticket
      const response = await api.post("/support/tickets/create/", payload);
      const data = response.data;

      // Refresh tickets list
      const ticketsResponse = await api.get(`/support/tickets/user/${userId}/`);
      const ticketsData = ticketsResponse.data;
      console.log("Refreshed tickets after submission:", ticketsData);
      const transformedTickets = (ticketsData.tickets || []).map(ticket => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description || "",
        priority: ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : "Low",
        status: ticket.status ? ticket.status.replace("_", " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Open",
        category: ticket.category,
        ticketType: ticket.ticket_type,
        referenceId: ticket.reference_id,
        referenceTitle: ticket.reference_title,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      }));
      setTickets(transformedTickets);

      // Reset form
      setSubject("");
      setDescription("");
      setPriority("Low");
      setReferenceTitle("");
      setTicketType("Project");
      const projectsList = userProjects.filter(p => p.type === "Project");
      if (projectsList.length > 0) {
        setRelatedProjectId(`${projectsList[0].type}-${projectsList[0].id}`);
      } else {
        const jobsList = userProjects.filter(p => p.type === "Job");
        if (jobsList.length > 0) {
          setTicketType("Job");
          setRelatedProjectId(`${jobsList[0].type}-${jobsList[0].id}`);
        }
      }

      // Show success message
      alert(data.message || "Ticket created successfully");
    } catch (err) {
      console.error("Error creating ticket:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || "Failed to create ticket. Please try again.";
      setError(errorMsg);
    }
  };

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>

          <div className="col-lg-12">
            <div className="dashboard_title_area">
              <h2>Support Center</h2>
              <p className="text">Submit your queries or complaints related to your projects or jobs.</p>
            </div>
          </div>
        </div>

        <div className="row g-4 flex-column">
          {/* Support Tickets Box */}
          <div className="col-lg-12 mb-4">
            <div className="ps-widget bgc-white bdrs4 p30 overflow-hidden position-relative">
              <h4 className="mb-3">Your Support Tickets</h4>

              {ticketsLoading ? (
                <p className="text-center">Loading tickets...</p>
              ) : tickets.length > 0 ? (
                <div className="support-ticket-list">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="support-ticket-box p-3 mb-3 border rounded shadow-sm"
                      style={{ backgroundColor: "#f9f9f9" }}
                    >
                      <h5>{ticket.subject}</h5>
                      {ticket.description && (
                        <p>{ticket.description.length > 80 ? ticket.description.substring(0, 80) + "..." : ticket.description}</p>
                      )}
                      <p>
                        <strong>Reference:</strong> {ticket.referenceTitle || "N/A"}
                      </p>
                      <p>
                        <strong>Category:</strong> {ticket.category ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1) : "N/A"} &nbsp;|&nbsp;
                        <strong>Priority:</strong> {ticket.priority} &nbsp;|&nbsp;
                        <strong>Status:</strong> {ticket.status}
                      </p>
                      <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                        <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                      {/* Updated: View button links to ticket detail page */}
                      <Link href={`/support/${ticket.id}`}>
                        <button 
                          className="ud-btn btn-thm"
                          style={{ padding: '10px', fontSize: '14px', transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '38px', minHeight: '38px', textAlign: 'center' }}
                        >
                          <i className="fal fa-eye" style={{ transform: 'none', WebkitTransform: 'none', MozTransform: 'none', OTransform: 'none', display: 'block', margin: '0 auto' }}></i>
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">No support tickets submitted yet.</p>
              )}

              <Pagination1 />
            </div>
          </div>

          {/* Submit Ticket Box */}
          <div className="col-lg-12">
            <div className="ps-widget bgc-white bdrs4 p30 position-relative">
              <h4 className="mb-3">Submit a Ticket</h4>
              <form onSubmit={handleAddTicket}>
                <div className="mb-3">
                  <label htmlFor="ticketType" className="form-label">Ticket Type</label>
                  <select
                    id="ticketType"
                    className="form-select"
                    value={ticketType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setTicketType(newType);
                      // Reset category selection when ticket type changes
                      const filtered = userProjects.filter(p => p.type === newType);
                      if (filtered.length > 0) {
                        setRelatedProjectId(`${filtered[0].type}-${filtered[0].id}`);
                      } else {
                        setRelatedProjectId("");
                      }
                    }}
                    disabled={loading}
                  >
                    <option value="Project">Project</option>
                    <option value="Job">Job</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="referenceTitle" className="form-label">Reference Title</label>
                  <input
                    id="referenceTitle"
                    type="text"
                    className="form-control"
                    value={referenceTitle}
                    onChange={(e) => setReferenceTitle(e.target.value)}
                    placeholder="Enter reference title"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="relatedProject" className="form-label">Category</label>
                  <select
                    id="relatedProject"
                    className="form-select"
                    value={relatedProjectId}
                    onChange={(e) => setRelatedProjectId(e.target.value)}
                    disabled={loading || userProjects.filter(p => p.type === ticketType).length === 0}
                  >
                    {userProjects.filter(p => p.type === ticketType).length === 0 && !loading ? (
                      <option value="">No {ticketType.toLowerCase()}s available</option>
                    ) : (
                      userProjects.filter(p => p.type === ticketType).map((p) => (
                        <option key={`${p.type}-${p.id}`} value={`${p.type}-${p.id}`}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    id="priority"
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="ud-btn btn-thm"
                  style={{ width: "100%" }}
                  disabled={loading || userProjects.filter(p => p.type === ticketType).length === 0}
                >
                  {loading ? "Loading..." : "Submit Ticket"}
                </button>

                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>

      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}
