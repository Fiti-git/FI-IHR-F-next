"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

// === Tabs ===
const tabs = [
  "Requested Services",
  "Accepted Services",
  "Payout",
  "Completed Services",
];

// === Tab 1: Requested Services ===
function RequestedServicesRow({ service }) {
  return (
    <tr>
      <td>{service.serviceName}</td>
      <td>{service.freelancerName}</td>
      <td>{service.status}</td>
    </tr>
  );
}

function RequestedServices() {
  const services = [
    { serviceName: "Logo Design", freelancerName: "Jane Doe", status: "Pending" },
    { serviceName: "Web Development", freelancerName: "John Smith", status: "Pending" },
    { serviceName: "SEO Audit", freelancerName: "Mike Lee", status: "Rejected" },
  ];

  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Service Name</th>
            <th>Freelancer Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {services.map((s, i) => (
            <RequestedServicesRow key={i} service={s} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// === Tab 2: Accepted Services ===
function AcceptedServicesRow({ service }) {
  return (
    <tr>
      <td>{service.serviceName}</td>
      <td>{service.freelancerName}</td>
      <td>{service.date} at {service.time}</td>
    </tr>
  );
}

function AcceptedServices() {
  const services = [
    { serviceName: "Content Writing", freelancerName: "Sara Lee", date: "2025-09-15", time: "10:00 AM" },
    { serviceName: "Mobile App Design", freelancerName: "Chris Evans", date: "2025-09-14", time: "2:00 PM" },
  ];

  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Service Name</th>
            <th>Freelancer Name</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {services.map((s, i) => (
            <AcceptedServicesRow key={i} service={s} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// === Tab 3: Payout ===
function PayoutRow({ service }) {
  return (
    <tr>
      <td>{service.serviceName}</td>
      <td>{service.freelancerName}</td>
      <td>${service.amount}</td>
      <td>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => alert(`Payout $${service.amount} to ${service.freelancerName}`)}
        >
          Payout
        </button>
      </td>
    </tr>
  );
}

function PayoutServices() {
  const services = [
    { serviceName: "Video Editing", freelancerName: "Lana Stark", amount: 500 },
    { serviceName: "Translation", freelancerName: "Carlos Ruiz", amount: 300 },
  ];

  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Service Name</th>
            <th>Freelancer Name</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {services.map((s, i) => (
            <PayoutRow key={i} service={s} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// === Tab 4: Completed Services ===
function CompletedServicesRow({ service }) {
  return (
    <tr>
      <td>{service.freelancerName}</td>
      <td>{service.serviceName}</td>
      <td>{service.status}</td>
    </tr>
  );
}

function CompletedServices() {
  const services = [
    { freelancerName: "Anna Bell", serviceName: "Voice Over", status: "Completed" },
    { freelancerName: "David Kim", serviceName: "Email Marketing", status: "Completed" },
  ];

  return (
    <div className="table-responsive">
      <table className="table table-style3 at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Freelancer Name</th>
            <th>Service Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {services.map((s, i) => (
            <CompletedServicesRow key={i} service={s} />
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Pagination1 />
      </div>
    </div>
  );
}

// === Main Component ===
export default function ManageRequestServices() {
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
              <h2>Manage Service Requests</h2>
              <p className="text">Track and manage requested, accepted, completed services, and payouts.</p>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <Link href="/service-4" className="ud-btn btn-dark default-box-shadow2">
                Request Service <i className="fal fa-arrow-right-long" />
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

                {selectedTab === 0 && <RequestedServices />}
                {selectedTab === 1 && <AcceptedServices />}
                {selectedTab === 2 && <PayoutServices />}
                {selectedTab === 3 && <CompletedServices />}
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
