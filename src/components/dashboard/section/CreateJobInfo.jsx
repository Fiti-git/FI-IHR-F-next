"use client";
import DashboardNavigation from "../header/DashboardNavigation";
import Jobform from "./JobFormInformation";
import UploadAttachment from "./UploadAttachment";

export default function CreateJobInfo() {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-9">
            <div className="dashboard_title_area">
              <h2>Post a Job</h2>
              <p className="text">Fill in the details below to create a new job listing.</p>
         
            </div>
          </div>
          <div className="col-lg-3">
            <div className="text-lg-end">
              <button type="submit" form="jobPostForm" className="ud-btn btn-dark">
                Save &amp; Publish
                <i className="fal fa-arrow-right-long" />
              </button>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <Jobform />
            <UploadAttachment />
          </div>
        </div>
      </div>
    </>
  );
}
