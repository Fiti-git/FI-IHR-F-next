"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// Tab labels
const tabs = [
  "Active Projects",
  "Proposals",
  "Ongoing Projects",
  "Project Milestones",
  "In Review",
  "Completed Projects",
];

// Reusable IconButton component
const IconButton = ({ onClick, title, iconClass, colorClass }) => (
  <button
    onClick={onClick}
    title={title}
    className={`btn btn-icon btn-sm ${colorClass || "btn-primary"} me-2`}
    style={{ border: "none", background: "transparent", cursor: "pointer" }}
  >
    <i className={iconClass} />
  </button>
);

// -----------------------
// === Active Projects ===

function ActiveProjectsRow({ project }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>{project.postedDate}</td>
      <td>{project.status}</td>
      <td>
        <button className="btn btn-link p-0 me-2" onClick={() => alert(`View ${project.name}`)}>
          View
        </button>
        <button className="btn btn-link p-0" onClick={() => alert(`Edit ${project.name}`)}>
          Edit
        </button>
      </td>
    </tr>
  );
}

function ActiveProjects() {
const projects = [
  { name: "Website Redesign", postedDate: "2025-09-01", status: "Open" },
  { name: "SEO Optimization", postedDate: "2025-08-25", status: "Open" },
  { name: "Content Marketing Plan", postedDate: "2025-08-15", status: "Closed" },
  { name: "Brand Identity Refresh", postedDate: "2025-07-30", status: "Open" },
  { name: "Backend API Development", postedDate: "2025-07-15", status: "Open" },
];


  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Project Name</th>
            <th>Posted Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {projects.map((p, i) => (
            <ActiveProjectsRow key={i} project={p} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// -----------------------
// === Proposals with toggle ===

function ProposalDetailsRow({ proposal }) {
  return (
    <tr>
      <td>{proposal.freelancer}</td>
      <td>{proposal.proposalDate}</td>
      <td>${proposal.bidAmount}</td>
      <td>{proposal.description}</td>
      <td>
        <button className="btn btn-success btn-sm me-2" onClick={() => alert(`Accept proposal from ${proposal.freelancer}`)}>
          Accept
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => alert(`Message ${proposal.freelancer}`)}>
          Message
        </button>
      </td>
    </tr>
  );
}

function ProposalsRow({ project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr>
        <td>{project.name}</td>
        <td>{project.proposalCount} Proposals</td>
        <td>
          <button
            className="btn btn-link p-0"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={`proposal-details-${project.id}`}
          >
            {expanded ? "Hide Proposals" : "View Proposals"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr id={`proposal-details-${project.id}`}>
          <td colSpan="3" className="p-0">
            <table className="table table-bordered m-0">
              <thead>
                <tr>
                  <th>Freelancer</th>
                  <th>Proposal Date</th>
                  <th>Bid Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.proposals.map((proposal, i) => (
                  <ProposalDetailsRow key={i} proposal={proposal} />
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

function Proposals() {
const projects = [
  {
    id: 1,
    name: "Mobile App UI",
    proposalCount: 3,
    proposals: [
      {
        freelancer: "Jane Doe",
        proposalDate: "2025-09-10",
        bidAmount: 1500,
        description: "Expert in React Native and Figma.",
      },
      {
        freelancer: "John Appleseed",
        proposalDate: "2025-09-11",
        bidAmount: 1400,
        description: "UI/UX specialist with 5 years experience.",
      },
      {
        freelancer: "Sara Lee",
        proposalDate: "2025-09-12",
        bidAmount: 1600,
        description: "Skilled in mobile UI design and prototyping.",
      },
    ],
  },
  {
    id: 2,
    name: "Website Revamp",
    proposalCount: 2,
    proposals: [
      {
        freelancer: "Mike Ross",
        proposalDate: "2025-08-30",
        bidAmount: 2000,
        description: "Full-stack developer and designer.",
      },
      {
        freelancer: "Rachel Zane",
        proposalDate: "2025-08-31",
        bidAmount: 2100,
        description: "Expert in SEO and front-end development.",
      },
    ],
  },
];


  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Project Name</th>
            <th>Proposals</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {projects.map((project) => (
            <ProposalsRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// -----------------------
// === Ongoing Projects ===

function OngoingProjectsRow({ project }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>{project.freelancer}</td>
      <td>{project.startDate}</td>
      <td>{project.progress}</td>
    </tr>
  );
}

function OngoingProjects() {
const projects = [
  {
    name: "eCommerce Platform",
    freelancer: "John Smith",
    startDate: "2025-08-15",
    progress: "3 of 5 milestones",
  },
  {
    name: "Marketing Website",
    freelancer: "Alice Johnson",
    startDate: "2025-07-20",
    progress: "2 of 4 milestones",
  },
  {
    name: "Internal Dashboard",
    freelancer: "Bob Lee",
    startDate: "2025-06-10",
    progress: "5 of 6 milestones",
  },
];


  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Project Name</th>
            <th>Freelancer</th>
            <th>Start Date</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {projects.map((p, i) => (
            <OngoingProjectsRow key={i} project={p} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// -----------------------
// === Project Milestones with toggle ===

function MilestoneDetailsRow({ milestone }) {
  return (
    <tr>
      <td>{milestone.name}</td>
      <td>{milestone.description}</td>
      <td>{milestone.dueDate}</td>
      <td>{milestone.status}</td>
      <td>
        <button className="btn btn-success btn-sm me-2" onClick={() => alert(`Approve ${milestone.name}`)}>
          Approve
        </button>
        <button className="btn btn-warning btn-sm" onClick={() => alert(`Request changes for ${milestone.name}`)}>
          Request Changes
        </button>
      </td>
    </tr>
  );
}

function ProjectMilestonesRow({ project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr>
        <td>{project.name}</td>
        <td>
          <button
            className="btn btn-link p-0"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={`milestone-details-${project.id}`}
          >
            {expanded ? "Hide Milestones" : "View Milestones"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr id={`milestone-details-${project.id}`}>
          <td colSpan="2" className="p-0">
            <table className="table table-bordered m-0">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.milestones.map((ms, i) => (
                  <MilestoneDetailsRow key={i} milestone={ms} />
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

function ProjectMilestones() {
const projects = [
  {
    id: 1,
    name: "CRM Integration",
    milestones: [
      {
        name: "Phase 1",
        description: "API Setup",
        dueDate: "2025-09-20",
        status: "Pending Approval",
      },
      {
        name: "Phase 2",
        description: "Data Migration",
        dueDate: "2025-10-05",
        status: "In Progress",
      },
      {
        name: "Phase 3",
        description: "Testing and Deployment",
        dueDate: "2025-10-20",
        status: "Upcoming",
      },
    ],
  },
  {
    id: 2,
    name: "Mobile App Development",
    milestones: [
      {
        name: "Design Mockups",
        description: "Create UI/UX designs",
        dueDate: "2025-09-15",
        status: "Completed",
      },
      {
        name: "API Integration",
        description: "Connect app to backend APIs",
        dueDate: "2025-09-30",
        status: "In Progress",
      },
      {
        name: "Beta Release",
        description: "Initial release to testers",
        dueDate: "2025-10-10",
        status: "Upcoming",
      },
    ],
  },
];


  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Project Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {projects.map((project) => (
            <ProjectMilestonesRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// -----------------------
// === In Review with toggle ===

function ReviewDetailsRow({ review }) {
  return (
    <tr>
      <td>{review.milestone}</td>
      <td>{review.reviewer}</td>
      <td>{review.status}</td>
      <td>{review.comments}</td>
      <td>
        <button className="btn btn-primary btn-sm" onClick={() => alert(`Payout for ${review.milestone}`)}>
          Payout
        </button>
      </td>
    </tr>
  );
}

function InReviewRow({ project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr>
        <td>{project.name}</td>
        <td>
          <button
            className="btn btn-link p-0"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={`review-details-${project.id}`}
          >
            {expanded ? "Hide Review" : "Review"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr id={`review-details-${project.id}`}>
          <td colSpan="2" className="p-0">
            <table className="table table-bordered m-0">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Reviewer</th>
                  <th>Review Status</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {project.reviews.map((review, i) => (
                  <ReviewDetailsRow key={i} review={review} />
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

function InReview() {
const projects = [
  {
    id: 1,
    name: "Landing Page Build",
    reviews: [
      {
        milestone: "Final Deployment",
        reviewer: "Client A",
        status: "Needs Payout",
        comments: "Looks great!",
      },
      {
        milestone: "Design Approval",
        reviewer: "Client A",
        status: "Approved",
        comments: "Excellent work on the design.",
      },
    ],
  },
  {
    id: 2,
    name: "Blog Platform",
    reviews: [
      {
        milestone: "Content Review",
        reviewer: "Client B",
        status: "Pending",
        comments: "Waiting for client feedback.",
      },
      {
        milestone: "SEO Optimization",
        reviewer: "Client B",
        status: "Approved",
        comments: "Well optimized content.",
      },
    ],
  },
];


  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Project Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {projects.map((project) => (
            <InReviewRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// -----------------------
// === Completed Projects ===

function CompletedProjectsRow({ project }) {
  return (
    <tr>
      <td>{project.name}</td>
      <td>{project.client}</td>
      <td>{project.completionDate}</td>
      <td>{project.outcome}</td>
    </tr>
  );
}

function CompletedProjects() {
const projects = [
  {
    name: "Logo Design",
    client: "Client B",
    completionDate: "2025-09-01",
    outcome: "Successful",
  },
  {
    name: "Social Media Campaign",
    client: "Client C",
    completionDate: "2025-08-15",
    outcome: "Successful",
  },
  {
    name: "Product Launch Website",
    client: "Client D",
    completionDate: "2025-07-30",
    outcome: "Successful",
  },
];


  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Project Name</th>
            <th>Client</th>
            <th>Completion Date</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {projects.map((p, i) => (
            <CompletedProjectsRow key={i} project={p} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// -----------------------
// === Main Component ===

export default function ManageProjectInfo() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Manage Projects</h2>
              <p className="text">View and manage all projects, proposals, milestones, and reviews.</p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link href="/create-projects" className="ud-btn btn-dark default-box-shadow2">
                Post Project <i className="fal fa-arrow-right-long" />
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <div className="navtab-style1">
                <nav>
                  <div className="nav nav-tabs mb30">
                    {tabs.map((label, i) => (
                      <button
                        key={i}
                        className={`nav-link fw500 ps-0 ${selectedTab === i ? "active" : ""}`}
                        onClick={() => setSelectedTab(i)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </nav>

                {selectedTab === 0 && <ActiveProjects />}
                {selectedTab === 1 && <Proposals />}
                {selectedTab === 2 && <OngoingProjects />}
                {selectedTab === 3 && <ProjectMilestones />}
                {selectedTab === 4 && <InReview />}
                {selectedTab === 5 && <CompletedProjects />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}
