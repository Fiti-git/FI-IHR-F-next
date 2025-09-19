"use client";
import { useState } from "react";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

const userProjects = [
  { id: 1, type: "Project", name: "Mobile App Development" },
  { id: 2, type: "Job", name: "Logo Design Job" },
  { id: 3, type: "Project", name: "Website Redesign" },
];

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

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [relatedProjectId, setRelatedProjectId] = useState(userProjects[0]?.id || "");
  const [error, setError] = useState("");

  const handleAddTicket = (e) => {
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

    const newTicket = {
      id: tickets.length + 1,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: "Open",
      relatedProject: userProjects.find((p) => p.id === Number(relatedProjectId)),
      createdAt: new Date().toISOString(),
    };

    setTickets([...tickets, newTicket]);

    setSubject("");
    setDescription("");
    setPriority("Low");
    setRelatedProjectId(userProjects[0]?.id || "");
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
                  <label htmlFor="relatedProject" className="form-label">Project / Job</label>
                  <select
                    id="relatedProject"
                    className="form-select"
                    value={relatedProjectId}
                    onChange={(e) => setRelatedProjectId(e.target.value)}
                  >
                    {userProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.type} - {p.name}
                      </option>
                    ))}
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
                >
                  Submit Ticket
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
