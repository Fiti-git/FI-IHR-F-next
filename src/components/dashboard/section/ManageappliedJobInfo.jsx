"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

// Dummy job data
const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    department: "Engineering",
    jobType: "Full-time",
    workLocation: "Dubai Office",
    workMode: "On-site",
    roleOverview: "Responsible for building responsive web interfaces.",
    keyResponsibilities: [
      "Develop UI components with React and Next.js",
      "Collaborate with backend team",
      "Maintain code quality"
    ],
    requiredQualifications: [
      "3+ years experience in frontend development",
      "Proficiency in React",
      "Knowledge of CSS and JavaScript"
    ],
    preferredQualifications: [
      "Experience with Next.js",
      "Familiarity with UI/UX principles"
    ],
    languagesRequired: ["English"],
    category: "Web Development",
    salaryFrom: 15000,
    salaryTo: 22000,
    currency: "AED",
    applicationDeadline: "2025-09-15",
    applicationMethod: "Portal",
    interviewMode: "In-person",
    hiringManager: "Sarah Connor",
    numberOfOpenings: 2,
    expectedStartDate: "2025-10-01",
    screeningQuestions: [
      "Do you have experience with React hooks?",
      "Are you willing to relocate?"
    ],
    benefits: {
      healthInsurance: true,
      remoteWork: false,
      paidLeave: true,
      bonus: true,
    },
    date: "2025-09-10",
    status: "Open",
    description: "Build and maintain UI components with React and Next.js.",
    userApplicationStatus: "Interviewed", // or "Rejected", "Hired"
    interviewDetails: {
      date: "2025-09-20",
      time: "10:00 AM",
      link: "https://zoom.us/j/123456789",
    },
  },
  {
  id: 2,
  title: "UI/UX Designer",
  department: "Design",
  jobType: "Part-time",
  workLocation: "Remote",
  workMode: "Remote",
  roleOverview: "Design intuitive and visually appealing user interfaces.",
  keyResponsibilities: [
    "Create wireframes and prototypes",
    "Conduct user research",
    "Collaborate with developers and product team"
  ],
  requiredQualifications: [
    "2+ years of UI/UX experience",
    "Proficiency in Figma or Sketch",
    "Strong portfolio of design projects"
  ],
  preferredQualifications: [
    "Experience with accessibility standards",
    "Understanding of front-end development"
  ],
  languagesRequired: ["English", "Arabic"],
  category: "Design",
  salaryFrom: 8000,
  salaryTo: 12000,
  currency: "AED",
  applicationDeadline: "2025-09-18",
  applicationMethod: "Email",
  interviewMode: "Online",
  hiringManager: "Emily Clark",
  numberOfOpenings: 1,
  expectedStartDate: "2025-10-10",
  screeningQuestions: [
    "Do you have experience with Figma?",
    "Have you worked in Agile teams?"
  ],
  benefits: {
    healthInsurance: true,
    remoteWork: true,
    paidLeave: true,
    bonus: false
  },
  date: "2025-09-05",
  status: "Closed",
  description: "We’re looking for a UI/UX Designer to help shape the user experience of our web applications.",
  selectedCandidate: "Lisa Ray",
  applicants: [],
  userApplicationStatus: "Rejected"
},
{
  id: 3,
  title: "Digital Marketing Specialist",
  department: "Marketing",
  jobType: "Contract",
  workLocation: "Dubai",
  workMode: "Hybrid",
  roleOverview: "Plan and execute digital marketing campaigns.",
  keyResponsibilities: [
    "Manage social media accounts",
    "Run paid ad campaigns",
    "Monitor analytics and KPIs"
  ],
  requiredQualifications: [
    "Experience in digital marketing",
    "Knowledge of SEO and SEM",
    "Content creation skills"
  ],
  preferredQualifications: [
    "Experience with Google Ads and Meta Business",
    "Email marketing experience"
  ],
  languagesRequired: ["English"],
  category: "Marketing",
  salaryFrom: 10000,
  salaryTo: 15000,
  currency: "AED",
  applicationDeadline: "2025-09-20",
  applicationMethod: "Portal",
  interviewMode: "Online",
  hiringManager: "Ahmed Yousuf",
  numberOfOpenings: 2,
  expectedStartDate: "2025-10-05",
  screeningQuestions: [
    "Have you managed paid campaigns?",
    "What tools do you use for analytics?"
  ],
  benefits: {
    healthInsurance: true,
    remoteWork: true,
    paidLeave: false,
    bonus: true
  },
  date: "2025-09-12",
  status: "Open",
  description: "Looking for a results-driven digital marketing specialist to boost our online presence.",
  selectedCandidate: null,
  applicants: [],
  userApplicationStatus: "Interviewed",
  interviewDetails: {
    date: "2025-09-22",
    time: "11:30 AM",
    link: "https://meet.google.com/interview-digital-marketing"
  }
},
{
  id: 4,
  title: "Backend Engineer",
  department: "Engineering",
  jobType: "Full-time",
  workLocation: "Abu Dhabi Office",
  workMode: "On-site",
  roleOverview: "Design and maintain scalable backend services and APIs.",
  keyResponsibilities: [
    "Build RESTful APIs using Node.js",
    "Maintain and scale databases",
    "Write unit and integration tests"
  ],
  requiredQualifications: [
    "3+ years backend experience",
    "Proficient in Node.js and Express",
    "Database design knowledge (SQL/NoSQL)"
  ],
  preferredQualifications: [
    "Experience with AWS",
    "Familiarity with microservices"
  ],
  languagesRequired: ["English"],
  category: "Web Development",
  salaryFrom: 16000,
  salaryTo: 24000,
  currency: "AED",
  applicationDeadline: "2025-09-25",
  applicationMethod: "Portal",
  interviewMode: "In-person",
  hiringManager: "Omar Khalid",
  numberOfOpenings: 1,
  expectedStartDate: "2025-10-15",
  screeningQuestions: [
    "Have you used AWS Lambda?",
    "What testing tools do you use?"
  ],
  benefits: {
    healthInsurance: true,
    remoteWork: false,
    paidLeave: true,
    bonus: true
  },
  date: "2025-09-15",
  status: "Closed",
  description: "We're seeking a backend engineer with experience in building secure and high-performance APIs.",
  selectedCandidate: "You",
  applicants: [],
  userApplicationStatus: "Hired"
}

];

export default function AppliedJobDetailPage() {
  const params = useParams();
  const jobId = parseInt(params.id, 10);
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="dashboard__content hover-bgc-color container mt-5">
        <h2>Job not found</h2>
        <Link href="/applied-jobs" className="btn btn-primary mt-3">
          Back to Applied Jobs
        </Link>
      </div>
    );
  }

  const { userApplicationStatus, interviewDetails } = job;

  const statusBadgeClass = {
    Rejected: "badge bg-danger",
    Interviewed: "badge bg-warning text-dark",
    Hired: "badge bg-success",
  };

  return (
    <div className="dashboard__content hover-bgc-color container mt-5">
      <div className="row pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area d-flex justify-content-between align-items-center">
            <div>
              <h2>{job.title}</h2>
              <p className="text">Full Job Description and Your Application Status</p>
            </div>
            <div>
              <Link href="/manage-myjobs" className="ud-btn btn-dark default-box-shadow2">
                Back to Applied Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <strong>Status: </strong>
        <span className={statusBadgeClass[userApplicationStatus] || "badge bg-secondary"}>
          {userApplicationStatus}
        </span>
      </div>

      {/* Job Description */}
      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Job Overview</h5>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Role Overview:</strong> {job.roleOverview}</p>
        <p><strong>Department / Team:</strong> {job.department}</p>
        <p><strong>Job Type:</strong> {job.jobType}</p>
        <p><strong>Work Location:</strong> {job.workLocation}</p>
        <p><strong>Work Mode:</strong> {job.workMode}</p>
        <p><strong>Posted Date:</strong> {job.date}</p>
        <p><strong>Category:</strong> {job.category}</p>
      </div>

      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Key Responsibilities</h5>
        <ul className="text-muted">
          {job.keyResponsibilities.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Qualifications</h5>
        <p><strong>Required:</strong></p>
        <ul>
          {job.requiredQualifications.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <p><strong>Preferred:</strong></p>
        <ul>
          {job.preferredQualifications.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <p><strong>Languages Required:</strong> {job.languagesRequired.join(", ")}</p>
      </div>

      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Application Info</h5>
        <p><strong>Application Deadline:</strong> {job.applicationDeadline}</p>
        <p><strong>Application Method:</strong> {job.applicationMethod}</p>
        <p><strong>Interview Mode:</strong> {job.interviewMode}</p>
        <p><strong>Hiring Manager:</strong> {job.hiringManager}</p>
        <p><strong>Number of Openings:</strong> {job.numberOfOpenings}</p>
        <p><strong>Expected Start Date:</strong> {job.expectedStartDate}</p>
        <p><strong>Screening Questions:</strong></p>
        <ul>
          {job.screeningQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
        <h5 className="fw500 mb-3">Salary & Benefits</h5>
        <p>
          <strong>Salary:</strong> {job.salaryFrom.toLocaleString()} – {job.salaryTo.toLocaleString()} {job.currency}
        </p>
        <ul>
          <li>Health Insurance: {job.benefits.healthInsurance ? "Yes" : "No"}</li>
          <li>Remote Work: {job.benefits.remoteWork ? "Yes" : "No"}</li>
          <li>Paid Leave: {job.benefits.paidLeave ? "Yes" : "No"}</li>
          <li>Bonus: {job.benefits.bonus ? "Yes" : "No"}</li>
        </ul>
      </div>

      {/* Interview Box */}
      {userApplicationStatus === "Interviewed" && interviewDetails && (
        <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
          <h5 className="fw500 mb-3">Interview Details</h5>
          <p><strong>Date:</strong> {interviewDetails.date}</p>
          <p><strong>Time:</strong> {interviewDetails.time}</p>
          <p>
            <strong>Link:</strong>{" "}
            <a
              href={interviewDetails.link}
              className="btn btn-primary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Interview
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
