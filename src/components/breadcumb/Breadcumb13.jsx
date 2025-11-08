"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
        const headers = { 'Content-Type': 'application/json' };
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`http://206.189.134.117:8000/api/job-posting/${id}/`, { headers });
        if (res.status === 401) {
          // Unauthorized - token missing or invalid
          console.warn('Unauthorized when fetching job details');
          setJob(null);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error(err);
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
              <div className="col-xl-8 mx-auto">
                <div className="position-relative">
                  <div className="list-meta d-lg-flex align-items-end justify-content-between">
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
                        <h4 className="title">{titleText}</h4>

                        <h6 className="list-inline-item mb-0">
                          {salaryText || "$125k-$135k Hourly"}
                        </h6>
                        <h6 className="list-inline-item mb-0 bdrl-eunry pl15">
                          {deadlineText || 'Deadline N/A'}
                        </h6>
                        <h6 className="list-inline-item mb-0 bdrl-eunry pl15">
                          {statusText || 'Status N/A'}
                        </h6>
                        <h6 className="list-inline-item mb-0 bdrl-eunry pl15">
                          {modeText || 'Mode N/A'}
                        </h6>
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
