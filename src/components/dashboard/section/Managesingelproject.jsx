"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Dummy project data with proposals, milestones, payments, etc.
const projects = [
  {
    id: 1,
    name: "Website Redesign",
    postedDate: "2025-09-01",
    status: "Open", // Open, Ongoing, Closed
    description: "Redesign corporate website with modern UI/UX.",
    proposals: [
      {
        id: 1,
        freelancerName: "Alice Smith",
        budget: 2000,
        proposalDetails: "I can deliver a modern, responsive design in 3 weeks.",
      },
      {
        id: 2,
        freelancerName: "Bob Johnson",
        budget: 2500,
        proposalDetails: "Experienced designer, quick turnaround.",
      },
    ],
    selectedFreelancer: null, // when ongoing, will be an object { id, name }
    milestones: [],
    payments: [],
  },
  {
    id: 2,
    name: "Mobile App Development",
    postedDate: "2025-08-15",
    status: "Ongoing",
    description: "Develop a cross-platform mobile app.",
    proposals: [
      {
        id: 3,
        freelancerName: "Chris Lee",
        budget: 5000,
        proposalDetails: "Expert mobile developer, 2 months timeline.",
      },
    ],
    selectedFreelancer: { id: 3, name: "Chris Lee" },
    milestones: [
      {
        id: 1,
        name: "Design Phase",
        startDate: "2025-08-20",
        endDate: "2025-09-10",
        budget: 1500,
      },
      {
        id: 2,
        name: "Development Phase",
        startDate: "2025-09-11",
        endDate: "2025-11-01",
        budget: 3500,
      },
    ],
    payments: [
      {
        id: "PAY123",
        status: "Paid", // "Paid" or "To Pay"
        requestDate: "2025-08-25",
        paidDate: "2025-08-30",
      },
      {
        id: "PAY124",
        status: "To Pay",
        requestDate: "2025-09-15",
        paidDate: null,
      },
    ],
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id, 10);
  const project = projects.find((p) => p.id === projectId);

  const [showProposals, setShowProposals] = useState(true);
  const [showSelectedFreelancer, setShowSelectedFreelancer] = useState(true);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showPayments, setShowPayments] = useState(true);

  if (!project) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Project not found</h2>
        <Link href="/manage-projects" className="btn btn-primary mt-3">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Handlers for actions (you can replace alerts with modals or API calls)
  const handleViewProfile = (freelancerName) => alert(`View Profile: ${freelancerName}`);
  const handleViewProposal = (freelancerName) => alert(`View Proposal: ${freelancerName}`);
  const handleRejectProposal = (freelancerName) => alert(`Reject Proposal: ${freelancerName}`);
  const handlePayout = (paymentId) => alert(`Payout initiated for Payment ID: ${paymentId}`);

  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      {/* Title and Edit Button */}
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{project.name}</h2>
              <p className="text">Manage this project details and proposals.</p>
            </div>
            <div>
              <Link
                href={`/edit-project/${project.id}`}
                className="ud-btn btn-dark default-box-shadow2"
              >
                Edit Project <i className="fal fa-edit" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details Box */}
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <h5 className="fw500 mb-3">Project Details</h5>
            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Posted Date:</strong> {project.postedDate}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`badge ${project.status === "Open" ? "bg-success" : "bg-info"}`}>
                {project.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Proposal List (if project is OPEN) */}
      {project.status === "Open" && (
        <div className="row">
          <div className="col-xl-12">
            <div className="mb-4 border rounded p-3">
              <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setShowProposals(!showProposals)}
              >
                <h5 className="fw500 mb-0">Proposal List</h5>
                <span>{showProposals ? "−" : "+"}</span>
              </div>

              {showProposals && (
                <div className="mt-3 table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table className="table-style3 table at-savesearch mb-0">
                    <thead className="t-head">
                      <tr>
                        <th>Freelancer Name</th>
                        <th>Budget</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="t-body">
                      {project.proposals.length > 0 ? (
                        project.proposals.map((proposal) => (
                          <tr key={proposal.id}>
                            <td>{proposal.freelancerName}</td>
                            <td>{proposal.budget.toLocaleString()} AED</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleViewProfile(proposal.freelancerName)}
                              >
                                View Profile
                              </button>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => handleViewProposal(proposal.freelancerName)}
                              >
                                View Proposal
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRejectProposal(proposal.freelancerName)}
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No proposals yet.
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
      )}

      {/* Selected Freelancer, Milestones, Payments (if project ONGOING) */}
      {project.status === "Ongoing" && (
        <>
          {/* Selected Freelancer */}
          <div className="row">
            <div className="col-xl-12">
              <div className="mb-4 border rounded p-3">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => setShowSelectedFreelancer(!showSelectedFreelancer)}
                >
                  <h5 className="fw500 mb-0">Selected Freelancer</h5>
                  <span>{showSelectedFreelancer ? "−" : "+"}</span>
                </div>
                {showSelectedFreelancer && (
                  <div className="mt-3">
                    <p><strong>Name:</strong> {project.selectedFreelancer?.name || "N/A"}</p>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleViewProfile(project.selectedFreelancer?.name)}
                    >
                      View Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="row">
            <div className="col-xl-12">
              <div className="mb-4 border rounded p-3">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => setShowMilestones(!showMilestones)}
                >
                  <h5 className="fw500 mb-0">Milestones</h5>
                  <span>{showMilestones ? "−" : "+"}</span>
                </div>
                {showMilestones && (
                  <div className="mt-3 table-responsive">
                    <table className="table-style3 table at-savesearch mb-0">
                      <thead className="t-head">
                        <tr>
                          <th>Milestone Name</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Budget (AED)</th>
                        </tr>
                      </thead>
                      <tbody className="t-body">
                        {project.milestones.length > 0 ? (
                          project.milestones.map((m) => (
                            <tr key={m.id}>
                              <td>{m.name}</td>
                              <td>{m.startDate}</td>
                              <td>{m.endDate}</td>
                              <td>{m.budget.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">
                              No milestones set.
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

          {/* Next Payments */}
          <div className="row">
            <div className="col-xl-12">
              <div className="mb-4 border rounded p-3">
                <div
                  className="d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => setShowPayments(!showPayments)}
                >
                  <h5 className="fw500 mb-0">Next Payments</h5>
                  <span>{showPayments ? "−" : "+"}</span>
                </div>

                {showPayments && (
                  <div className="mt-3 table-responsive">
                    <table className="table-style3 table at-savesearch mb-0">
                      <thead className="t-head">
                        <tr>
                          <th>Payment ID</th>
                          <th>Status</th>
                          <th>Request Date</th>
                          <th>Paid Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="t-body">
                        {project.payments.length > 0 ? (
                          project.payments.map((payment) => (
                            <tr key={payment.id}>
                              <td>{payment.id}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    payment.status === "Paid" ? "bg-success" : "bg-warning text-dark"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                              <td>{payment.requestDate}</td>
                              <td>{payment.paidDate || "-"}</td>
                              <td>
                                {payment.status === "To Pay" ? (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handlePayout(payment.id)}
                                  >
                                    Pay Out
                                  </button>
                                ) : (
                                  <span className="text-muted">No action</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">
                              No payments available.
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
        </>
      )}
    </div>
  );
}
