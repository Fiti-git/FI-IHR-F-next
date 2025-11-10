"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardNavigation from "@/components/dashboard/header/DashboardNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import Jobform from "@/components/dashboard/section/JobFormInformation";
// import UploadAttachment from "@/components/dashboard/section/UploadAttachment";
import api from '@/lib/axios';

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id;
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/job-posting/${jobId}/`);
        setInitialData(res.data);
      } catch (err) {
        console.error('Error loading job:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) load();
  }, [jobId]);

  if (loading) return <div className="container mt-5">Loading job...</div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!initialData) return <div className="container mt-5"><div className="alert alert-info">Job not found</div></div>;

  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <div className="dashboard__content hover-bgc-color">
          <div className="row pb40">
            <div className="col-lg-12">
              <DashboardNavigation />
            </div>
            <div className="col-lg-9">
              <div className="dashboard_title_area">
                <h2>Edit Job</h2>
                <p className="text">Edit and publish updates to this job posting.</p>
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
              <Jobform initialData={initialData} mode="edit" jobId={jobId} />
              {/* <UploadAttachment /> */}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
