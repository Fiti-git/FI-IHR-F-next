"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Dummy project data for freelancer’s project
const projects = [
  {
    id: 1,
    name: "Website Redesign",
    appliedDate: "2025-09-01",
    status: "Rejected", // "Rejected", "Accepted", "Ongoing", "Closed"
    description: "Redesign corporate website with modern UI/UX.",
    milestoneRequests: [],
    payments: [],
  },
  {
    id: 2,
    name: "Mobile App Development",
    appliedDate: "2025-08-15",
    status: "Accepted",
    acceptedDate: "2025-08-20",
    description: "Develop a cross-platform mobile app.",
    milestoneRequests: [
    ],
  },
  {
    id: 3,
    name: "E-Commerce Website",
    appliedDate: "2025-07-30",
    status: "Ongoing",
    acceptedDate: "2025-08-01",
    description: "Build fully functional e-commerce oriented site.",
    milestoneRequests: [
      {
        id: 1,
        name: "Design UI",
        deadline: "2025-08-20",
        status: "Done",
      },
      {
        id: 2,
        name: "Backend API",
        deadline: "2025-09-30",
        status: "In Process",
      },
      {
        id: 3,
        name: "Integrations",
        deadline: "2025-10-30",
        status: "To Do",
      },
    ],
    payments: [
      {
        id: "PAY300",
        status: "Paid",
        requestDate: "2025-08-25",
        paidDate: "2025-08-30",
      },
      {
        id: "PAY301",
        status: "Requested",
        requestDate: "2025-09-15",
        paidDate: null,
      },
    ],
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    appliedDate: "2025-06-10",
    status: "Closed",
    acceptedDate: "2025-06-15",
    description: "Create an analytics dashboard for business KPIs.",
    completedDate: "2025-09-01",
    milestoneRequests: [
      {
        id: 1,
        name: "Design Mockups",
        deadline: "2025-07-01",
        status: "Done",
      },
      {
        id: 2,
        name: "Backend Setup",
        deadline: "2025-07-20",
        status: "Done",
      },
      {
        id: 3,
        name: "Frontend Development",
        deadline: "2025-08-15",
        status: "Done",
      },
    ],
    payments: [
      {
        id: "PAY400",
        status: "Paid",
        requestDate: "2025-07-05",
        paidDate: "2025-07-10",
      },
      {
        id: "PAY401",
        status: "Paid",
        requestDate: "2025-08-20",
        paidDate: "2025-08-25",
      },
      {
        id: "PAY402",
        status: "Paid",
        requestDate: "2025-09-01",
        paidDate: "2025-09-02",
      },
    ],
  },
];

export default function FreelancerProjectDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id, 10);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Project not found</h2>
        <Link href="/freelancer-projects" className="btn btn-primary mt-3">
          Back to Projects
        </Link>
      </div>
    );
  }

  const handleCreateMilestone = () => {
    alert("Go to create milestone page");
  };

  const handleRequestPayment = (paymentId) => {
    alert("Request payment for: " + paymentId);
  };

  // Helper to check if all milestones done
  const allMilestonesDone =
    project.milestoneRequests.length > 0 &&
    project.milestoneRequests.every((m) => m.status === "Done");

  // Helper to check if all payments paid
  const allPaymentsPaid =
    project.payments.length > 0 &&
    project.payments.every((p) => p.status === "Paid");

  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      {/* Title */}
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{project.name}</h2>
              <p className="text">Details of your application.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Basic Info & Status */}
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <h5 className="fw500 mb-3">Project Details</h5>
            <p>
              <strong>Description:</strong> {project.description}
            </p>
            <p>
              <strong>Applied Date:</strong> {project.appliedDate}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  project.status === "Rejected"
                    ? "bg-danger"
                    : project.status === "Accepted"
                    ? "bg-success"
                    : project.status === "Ongoing"
                    ? "bg-primary"
                    : project.status === "Closed"
                    ? "bg-secondary"
                    : "bg-secondary"
                }`}
              >
                {project.status}
              </span>
            </p>
            {(project.status === "Accepted" || project.status === "Ongoing" || project.status === "Closed") &&
              project.acceptedDate && (
                <p>
                  <strong>Accepted Date:</strong> {project.acceptedDate}
                </p>
              )}
            {project.status === "Closed" && project.completedDate && (
              <p>
                <strong>Completed Date:</strong> {project.completedDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rejected */}
      {project.status === "Rejected" && (
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30">
              <h5 className="fw500">Application Rejected</h5>
              <p>We’re sorry, but your proposal was rejected.</p>
            </div>
          </div>
        </div>
      )}

      {/* Accepted (no milestones created yet) */}
      {project.status === "Accepted" && project.milestoneRequests.length === 0 && (
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30">
              <h5 className="fw500">Next Step</h5>
              <button className="btn btn-success" onClick={handleCreateMilestone}>
                Create Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ongoing */}
      {project.status === "Ongoing" && (
        <>
          {/* Milestones */}
          <div className="row">
            <div className="col-xl-12">
              <div className="mb-4 border rounded p-3">
                <h5 className="fw500">Milestones</h5>
                <div className="table-responsive">
                  <table className="table-style3 table at-savesearch mb-0">
                    <thead className="t-head">
                      <tr>
                        <th>Milestone</th>
                        <th>Deadline</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="t-body">
                      {project.milestoneRequests.length > 0 ? (
                        project.milestoneRequests.map((m) => (
                          <tr key={m.id}>
                            <td>{m.name}</td>
                            <td>{m.deadline}</td>
                            <td>
                              <span
                                className={`badge ${
                                  m.status === "Done"
                                    ? "bg-success"
                                    : m.status === "In Process"
                                    ? "bg-info"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No milestones yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="row">
            <div className="col-xl-12">
              <div className="mb-4 border rounded p-3">
                <h5 className="fw500">Payments</h5>
                <div className="table-responsive">
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
                                  payment.status === "Paid"
                                    ? "bg-success"
                                    : payment.status === "Requested"
                                    ? "bg-warning text-dark"
                                    : "bg-secondary"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td>{payment.requestDate}</td>
                            <td>{payment.paidDate ?? "-"}</td>
                            <td>
                              {payment.status === "Requested" ? (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleRequestPayment(payment.id)}
                                >
                                  Request Pay
                                </button>
                              ) : (
                                <span className="text-muted">No Action</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No payments yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Closed */}
      {project.status === "Closed" && (
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30">
              <h5 className="fw500">Project Completed</h5>
              {allMilestonesDone && allPaymentsPaid ? (
                <>
                  <p>
                    All milestones are completed and all payments have been
                    made.
                  </p>
                  <p>
                    <strong>Completion Date:</strong> {project.completedDate}
                  </p>
                </>
              ) : (
                <p>
                  Project marked closed but not all milestones/payments are
                  complete.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
