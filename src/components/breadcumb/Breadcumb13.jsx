"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from '@/lib/axios';

export default function Breadcumb13() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/api/job-posting/${id}/`);
        setJob(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Unauthorized - will be redirected by axios interceptor
          console.warn('Unauthorized when fetching job details');
          setJob(null);
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const titleText = job ? (job.job_title) : "Job";
  const salaryText = job
    ? ((job.salary_from || job.salary_to) ? `${job.salary_from || '-'} - ${job.salary_to || '-'} ${job.currency || ''}` : null)
    : null;
  const deadlineText = job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : null;
  const statusText = job?.job_status || job?.job_category || null;
  const statusDisplay = statusText ? String(statusText).replace(/_/g, ' ').toUpperCase() : 'N/A';
  const modeText = job?.work_mode || (typeof job?.remote_work === 'boolean' ? (job.remote_work ? 'Remote' : 'Onsite') : null);

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-job-v1 freelancer-single-style mx-auto maxw1700 pt120 pt60-sm pb120 pb60-sm bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">
          <Image
            height={226}
            width={198}
            className="left-top-img wow zoomIn"
            src="/images/vector-img/left-top.png"
            alt="left-top"
          />
          <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src="/images/vector-img/right-bottom.png"
            alt="right-bottom"
          />
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-7">
                <div className="position-relative">
                  <div className="d-flex align-items-center">
                    <div className="wrapper d-sm-flex align-items-center mb20-md">
                      <a className="position-relative freelancer-single-style">
                        {/* <Image
                          height={100}
                          width={100}
                          className="wa"
                          src="/images/team/job-single.png"
                          alt="job-single"
                        /> */}
                      </a>
                      <div className="ml20 ml0-xs mt15-sm">
                        <h2 className="text-black">{titleText}</h2>
                        <div className="mt-3 d-flex flex-wrap gap-3"></div>
                          <span className="badge bg-white text-dark px-3 py-2">
                            <i className="flaticon-folder me-2"></i>
                            {salaryText ?? "$125k-$135k Hourly"}
                          </span>
                          <span className="badge bg-white text-dark px-3 py-2">
                            <i className="flaticon-folder me-2"></i>
                            {deadlineText ?? "Deadline N/A"}
                          </span>
                          <span className={`badge px-3 py-2 ${
                            statusText === 'open' ? 'bg-success' : 
                            statusText === 'in_progress' ? 'bg-warning' : 
                            statusText === 'completed' ? 'bg-info' : 'bg-secondary'
                          }`}>
                            <i className="flaticon-tick me-2"></i>
                            {statusDisplay}
                          </span>
                          <span className="badge bg-white text-dark px-3 py-2">
                              <i className="flaticon-folder me-2"></i>
                              {modeText ?? "Mode N/A"}
                            </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
