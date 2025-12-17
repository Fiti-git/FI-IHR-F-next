"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";
import api from "@/lib/axios";

const dummyTickets = [
  {
    id: 1,
    subject: "Issue with payment processing",
    description: "I am unable to receive payment for my last completed project.",
    priority: "High",
    status: "Open",
    relatedProject: { id: 1, type: "Project", name: "Mobile App Development" },
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    subject: "Bug in job application",
    description: "The job application form crashes when I upload my resume.",
    priority: "Medium",
    status: "In Progress",
    relatedProject: { id: 2, type: "Job", name: "Logo Design Job" },
    createdAt: new Date().toISOString(),
  },
];

export default function SupportCenter() {
  const [tickets, setTickets] = useState(dummyTickets);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ticketType, setTicketType] = useState("Project");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [relatedProjectId, setRelatedProjectId] = useState("");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [error, setError] = useState("");

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

      // Create ticket object for UI
      const newTicket = {
        id: data.ticket_id,
        subject: subject.trim(),
        description: description.trim(),
        priority: priority,
        status: data.status.charAt(0).toUpperCase() + data.status.slice(1), // Capitalize first letter
        relatedProject,
        createdAt: data.created_at,
      };

      setTickets([...tickets, newTicket]);

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

              {tickets.length > 0 ? (
                <div className="support-ticket-list">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="support-ticket-box p-3 mb-3 border rounded shadow-sm"
                      style={{ backgroundColor: "#f9f9f9" }}
                    >
                      <h5>{ticket.subject}</h5>
                      <p>{ticket.description.length > 80 ? ticket.description.substring(0, 80) + "..." : ticket.description}</p>
                      <p>
                        <strong>Project/Job:</strong> {ticket.relatedProject?.type} - {ticket.relatedProject?.name}
                      </p>
                      <p>
                        <strong>Priority:</strong> {ticket.priority} &nbsp;|&nbsp; <strong>Status:</strong> {ticket.status}
                      </p>
                      {/* Updated: View button links to ticket detail page */}
                      <Link href={`/support/${ticket.id}`}>
                        <button className="btn btn-sm btn-primary">
                          View
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
                  className="btn btn-success"
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
