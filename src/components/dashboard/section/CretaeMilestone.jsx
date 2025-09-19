"use client";
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import { useState } from "react";
import Pagination1 from "@/components/section/Pagination1";
import ProposalModal1 from "../modal/ProposalModal1";
import DeleteModal from "../modal/DeleteModal";

const project = {
  id: 2,
  name: "Mobile App Development"
};

const initialMilestones = [
  // You can start with empty or prefill some example milestones
  // { id: 1, name: "Design UI", startDate: "2025-09-01", endDate: "2025-09-10", budget: 500 }
];

export default function CreateMilestone() {
  const [milestones, setMilestones] = useState(initialMilestones);

  // Form state
  const [milestoneName, setMilestoneName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  const handleAddMilestone = (e) => {
    e.preventDefault();
    setError("");

    if (!milestoneName.trim()) {
      setError("Please enter milestone name.");
      return;
    }
    if (!startDate) {
      setError("Please enter start date.");
      return;
    }
    if (!endDate) {
      setError("Please enter end date.");
      return;
    }
    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    const newMilestone = {
      id: milestones.length + 1,
      name: milestoneName.trim(),
      startDate,
      endDate,
      budget: Number(budget).toFixed(2),
    };

    setMilestones([...milestones, newMilestone]);

    // Clear form
    setMilestoneName("");
    setStartDate("");
    setEndDate("");
    setBudget("");
  };

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>

          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Milestone</h2>
              <p className="text">Project Name: {project.name}</p>
            </div>
          </div>

          {/* Save button on right */}
          <div className="col-lg-3">
            <div className="text-lg-end">
              <button
                className="ud-btn btn-dark default-box-shadow2"
                onClick={() => alert("Save functionality to be implemented")}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">

              {/* Title above table */}
              <h4 className="mb-3">CreateMilestone</h4>

              {/* Milestones Table */}
              <div className="table-responsive mb-4">
                <table className="table table-style3 at-savesearch">
                  <thead className="t-head">
                    <tr>
                      <th>Milestone Name</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Budget ($)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="t-body">
                    {milestones.length > 0 ? (
                      milestones.map((m) => (
                        <tr key={m.id}>
                          <td>{m.name}</td>
                          <td>{m.startDate}</td>
                          <td>{m.endDate}</td>
                          <td>{m.budget}</td>
                          <td>
                            {/* For now just a delete button */}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                setMilestones(milestones.filter((ms) => ms.id !== m.id))
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No milestones added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Milestone Form */}
              <form onSubmit={handleAddMilestone}>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label htmlFor="milestoneName" className="form-label">Milestone Name</label>
                    <input
                      id="milestoneName"
                      type="text"
                      className="form-control"
                      value={milestoneName}
                      onChange={(e) => setMilestoneName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label htmlFor="startDate" className="form-label">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label htmlFor="endDate" className="form-label">End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label htmlFor="budget" className="form-label">Budget ($)</label>
                    <input
                      id="budget"
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button type="submit" className="btn btn-success w-100">
                      Add
                    </button>
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
              </form>

              {/* Pagination if you want */}
              <div className="mt-3">
                <Pagination1 />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProposalModal1 />
      <DeleteModal />
    </>
  );
}
